// API: Import Data from Excel
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { upsertProjects, upsertTasks, Project, Task } from '@/lib/dataStore';
import { rateLimiters, checkRateLimit } from '@/lib/rateLimit';

// 🔒 SECURITY: Input sanitization function
function sanitizeString(value: any): string {
  if (typeof value !== 'string') return String(value ?? '');
  
  // Remove potential XSS payloads
  return value
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim();
}

function sanitizeNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value);
  if (isNaN(num)) return defaultValue;
  return num;
}

function sanitizeDate(value: any): string {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  if (isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

// Validate enum values
const VALID_PROJECT_STATUSES = ['Todo', 'In Progress', 'Review', 'Done', 'Cancelled'];
const VALID_TASK_STATUSES = ['Todo', 'In Progress', 'Done', 'Blocked'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

function sanitizeStatus(value: any, validValues: string[], defaultValue: string): string {
  if (typeof value !== 'string') return defaultValue;
  const normalized = value.trim();
  return validValues.includes(normalized) ? normalized : defaultValue;
}

export async function POST(req: NextRequest) {
  try {
    // 🔒 SECURITY: Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    // 🔒 SECURITY: Rate limiting
    const rateLimitResponse = await checkRateLimit(req, rateLimiters.import);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await req.json();
    const { data, type = 'projects', mode = 'upsert' } = body;

    // Validate input
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty data' },
        { status: 400 }
      );
    }

    // 🔒 SECURITY: Limit batch size to prevent DoS
    const MAX_BATCH_SIZE = 1000;
    if (data.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Batch size too large. Maximum ${MAX_BATCH_SIZE} records allowed` },
        { status: 400 }
      );
    }

    let result;

    if (type === 'projects') {
      // Transform and sanitize data for projects
      const projects: Project[] = data.map((item: any) => ({
        id: sanitizeString(item.id) || `p${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: sanitizeString(item.name) || 'Untitled Project',
        team: sanitizeString(item.team) || 'General',
        status: sanitizeStatus(item.status, VALID_PROJECT_STATUSES, 'Todo') as Project['status'],
        deadline: sanitizeDate(item.deadline),
        progress: Math.min(100, Math.max(0, sanitizeNumber(item.progress, 0))), // Clamp 0-100
        budget: Math.max(0, sanitizeNumber(item.budget, 0)), // No negative values
        revenue: Math.max(0, sanitizeNumber(item.revenue, 0)), // No negative values
        margin: Math.max(-100, Math.min(500, sanitizeNumber(item.margin, 0))), // Clamp -100 to 500
        description: sanitizeString(item.description) || undefined,
      }));

      result = await upsertProjects(projects);
    } else if (type === 'tasks') {
      // Transform and sanitize data for tasks
      const tasks: Task[] = data.map((item: any) => ({
        id: sanitizeString(item.id) || `t${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        projectId: sanitizeString(item.projectId) || 'p1',
        title: sanitizeString(item.title || item.name) || 'Untitled Task',
        description: sanitizeString(item.description) || undefined,
        assignee: sanitizeString(item.assignee) || 'Unassigned',
        status: sanitizeStatus(item.status, VALID_TASK_STATUSES, 'Todo') as Task['status'],
        priority: sanitizeStatus(item.priority, VALID_PRIORITIES, 'Medium') as Task['priority'],
        dueDate: sanitizeDate(item.dueDate || item.deadline),
        estimatedHours: Math.max(0, sanitizeNumber(item.estimatedHours, 0)),
        actualHours: Math.max(0, sanitizeNumber(item.actualHours, 0)),
        tags: Array.isArray(item.tags) ? item.tags.map(sanitizeString) : [],
      }));

      result = await upsertTasks(tasks);
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use "projects" or "tasks"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      imported: result.length,
      type,
      mode,
      message: `Successfully imported ${result.length} ${type} records`,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import data' }, // Don't expose internal error details
      { status: 500 }
    );
  }
}
