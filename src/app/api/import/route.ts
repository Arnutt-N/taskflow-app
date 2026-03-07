import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { read, utils } from 'xlsx';
import { TaskStatus, Priority } from '@prisma/client';

function parseTaskStatus(value: string): TaskStatus {
  const map: Record<string, TaskStatus> = {
    'TODO': 'TODO',
    'IN_PROGRESS': 'IN_PROGRESS',
    'REVIEW': 'REVIEW',
    'DONE': 'DONE',
    'BLOCKED': 'BLOCKED',
  };
  return map[value.toUpperCase()] || 'TODO';
}

function parsePriority(value: string): Priority {
  const map: Record<string, Priority> = {
    'LOW': 'LOW',
    'MEDIUM': 'MEDIUM',
    'HIGH': 'HIGH',
    'CRITICAL': 'CRITICAL',
  };
  return map[value.toUpperCase()] || 'MEDIUM';
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    if (!file || !type) {
      return NextResponse.json({ error: 'File and type are required' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const wb = read(buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = utils.sheet_to_json(ws) as Record<string, unknown>[];

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data found in the file' }, { status: 400 });
    }

    let count = 0;

    if (type === 'tasks') {
      const users = await prisma.user.findMany({ select: { id: true, name: true } });
      const userMap = new Map(users.map(u => [u.name, u.id]));
      
      const projects = await prisma.project.findMany({ select: { id: true, name: true } });
      const projectMap = new Map(projects.map(p => [p.name, p.id]));
      
      const skipped: string[] = [];

      for (const row of rows) {
        const title = String(row['Title'] || '').trim();
        if (!title) continue;

        const projectName = String(row['Project'] || '').trim();
        const projectId = projectName ? projectMap.get(projectName) : null;
        
        if (!projectId) {
          skipped.push(`"${title}" - Project "${projectName}" not found`);
          continue;
        }

        const assigneeName = String(row['Assignee'] || '').trim();
        const assigneeId = assigneeName ? (userMap.get(assigneeName) || null) : null;

        await prisma.task.create({
          data: {
            title,
            projectId,
            assigneeId,
            status: parseTaskStatus(String(row['Status'] || '')),
            priority: parsePriority(String(row['Priority'] || '')),
            dueDate: row['Due Date'] ? new Date(String(row['Due Date'])) : null,
          },
        });
        count++;
      }

      return NextResponse.json({ 
        success: true, 
        imported: count,
        skipped: skipped.length > 0 ? skipped : undefined,
      });
    }

    if (type === 'projects') {
      for (const row of rows) {
        const name = String(row['Name'] || '').trim();
        if (!name) continue;

        await prisma.project.create({
          data: {
            name,
            status: String(row['Status'] || 'TODO') as 'TODO',
            progress: Number(row['Progress (%)'] || 0),
            budget: Number(row['Budget (฿)'] || 0),
            revenue: Number(row['Revenue (฿)'] || 0),
            team: String(row['Team'] || ''),
            deadline: row['Deadline'] ? new Date(String(row['Deadline'])) : new Date(Date.now() + 90 * 24 * 3600 * 1000),
          },
        });
        count++;
      }
    }

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('[api/import] Error:', error);
    return NextResponse.json({ error: 'Import failed. Check file format.' }, { status: 500 });
  }
}
