// lib/dataStore.ts
// Unified data store - supports both file system (local) and TiDB (production)

import { promises as fs } from 'fs';
import path from 'path';
import * as db from './db/tidb';

// Detect environment
const USE_DATABASE = process.env.TIDB_DATABASE_URL || process.env.DATABASE_URL || process.env.TIDB_HOST;

// File system paths (for local development)
const DATA_DIR = process.env.TASKFLOW_DATA_DIR
  ? path.resolve(process.env.TASKFLOW_DATA_DIR)
  : path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// 🔒 SECURITY: Path traversal protection
function isSafePath(filePath: string): boolean {
  const resolved = path.resolve(filePath);
  const normalized = path.normalize(filePath);
  
  if (!resolved.startsWith(DATA_DIR)) {
    return false;
  }
  
  if (normalized.includes('..') || normalized.includes('~')) {
    return false;
  }
  
  return true;
}

function safeJoin(...paths: string[]): string {
  const joined = path.join(...paths);
  if (!isSafePath(joined)) {
    throw new Error('Path traversal attempt detected');
  }
  return joined;
}

// Ensure data directory exists (file system only)
async function ensureDataDir() {
  if (USE_DATABASE) return;
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// ==================== PROJECTS ====================

export interface Project {
  id: string;
  name: string;
  team: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Done';
  deadline: string;
  progress: number;
  budget: number;
  revenue: number;
  margin: number;
  description?: string;
}

export async function getProjects(): Promise<Project[]> {
  if (USE_DATABASE) {
    const rows = await db.query<any>(`
      SELECT id, name, team, status, 
             DATE_FORMAT(deadline, '%Y-%m-%dT%H:%i:%s.000Z') as deadline,
             progress, budget, revenue, margin, description
      FROM projects
      ORDER BY deadline ASC
    `);
    return rows;
  }
  
  // File system fallback
  await ensureDataDir();
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (USE_DATABASE) {
    return await db.queryOne<any>(`
      SELECT id, name, team, status,
             DATE_FORMAT(deadline, '%Y-%m-%dT%H:%i:%s.000Z') as deadline,
             progress, budget, revenue, margin, description
      FROM projects WHERE id = ?
    `, [id]);
  }
  
  const projects = await getProjects();
  return projects.find(p => p.id === id) || null;
}

export async function upsertProjects(projects: Project[]): Promise<Project[]> {
  if (USE_DATABASE) {
    for (const p of projects) {
      await db.execute(`
        INSERT INTO projects (id, name, team, status, deadline, progress, budget, revenue, margin, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          team = VALUES(team),
          status = VALUES(status),
          deadline = VALUES(deadline),
          progress = VALUES(progress),
          budget = VALUES(budget),
          revenue = VALUES(revenue),
          margin = VALUES(margin),
          description = VALUES(description)
      `, [p.id, p.name, p.team, p.status, p.deadline, p.progress, p.budget, p.revenue, p.margin, p.description || null]);
    }
    return projects;
  }
  
  // File system fallback
  await ensureDataDir();
  const existing = await getProjects();
  const map = new Map(existing.map(p => [p.id, p]));
  projects.forEach(p => map.set(p.id, p));
  const result = [...map.values()];
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(result, null, 2));
  return result;
}

export async function deleteProject(id: string): Promise<void> {
  if (USE_DATABASE) {
    await db.execute('DELETE FROM projects WHERE id = ?', [id]);
    return;
  }
  
  const projects = await getProjects();
  const filtered = projects.filter(p => p.id !== id);
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(filtered, null, 2));
}

// ==================== TASKS ====================

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assignee: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  tags?: string[];
}

export async function getTasks(): Promise<Task[]> {
  if (USE_DATABASE) {
    const rows = await db.query<any>(`
      SELECT id, project_id as projectId, title, description, assignee, status, priority,
             DATE_FORMAT(due_date, '%Y-%m-%dT%H:%i:%s.000Z') as dueDate,
             estimated_hours as estimatedHours, actual_hours as actualHours, tags
      FROM tasks
      ORDER BY due_date ASC
    `);
    return rows.map((r: any) => ({
      ...r,
      tags: r.tags ? JSON.parse(r.tags) : [],
    }));
  }
  
  // File system fallback
  await ensureDataDir();
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function getTaskById(id: string): Promise<Task | null> {
  if (USE_DATABASE) {
    const row = await db.queryOne<any>(`
      SELECT id, project_id as projectId, title, description, assignee, status, priority,
             DATE_FORMAT(due_date, '%Y-%m-%dT%H:%i:%s.000Z') as dueDate,
             estimated_hours as estimatedHours, actual_hours as actualHours, tags
      FROM tasks WHERE id = ?
    `, [id]);
    if (!row) return null;
    return { ...row, tags: row.tags ? JSON.parse(row.tags) : [] };
  }
  
  const tasks = await getTasks();
  return tasks.find(t => t.id === id) || null;
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  if (USE_DATABASE) {
    const rows = await db.query<any>(`
      SELECT id, project_id as projectId, title, description, assignee, status, priority,
             DATE_FORMAT(due_date, '%Y-%m-%dT%H:%i:%s.000Z') as dueDate,
             estimated_hours as estimatedHours, actual_hours as actualHours, tags
      FROM tasks WHERE project_id = ?
      ORDER BY due_date ASC
    `, [projectId]);
    return rows.map((r: any) => ({
      ...r,
      tags: r.tags ? JSON.parse(r.tags) : [],
    }));
  }
  
  const tasks = await getTasks();
  return tasks.filter(t => t.projectId === projectId);
}

export async function upsertTasks(tasks: Task[]): Promise<Task[]> {
  if (USE_DATABASE) {
    for (const t of tasks) {
      await db.execute(`
        INSERT INTO tasks (id, project_id, title, description, assignee, status, priority, due_date, estimated_hours, actual_hours, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          project_id = VALUES(project_id),
          title = VALUES(title),
          description = VALUES(description),
          assignee = VALUES(assignee),
          status = VALUES(status),
          priority = VALUES(priority),
          due_date = VALUES(due_date),
          estimated_hours = VALUES(estimated_hours),
          actual_hours = VALUES(actual_hours),
          tags = VALUES(tags)
      `, [t.id, t.projectId, t.title, t.description || null, t.assignee, t.status, t.priority, t.dueDate, t.estimatedHours, t.actualHours, JSON.stringify(t.tags || [])]);
    }
    return tasks;
  }
  
  // File system fallback
  await ensureDataDir();
  const existing = await getTasks();
  const map = new Map(existing.map(t => [t.id, t]));
  tasks.forEach(t => map.set(t.id, t));
  const result = [...map.values()];
  await fs.writeFile(TASKS_FILE, JSON.stringify(result, null, 2));
  return result;
}

export async function deleteTask(id: string): Promise<void> {
  if (USE_DATABASE) {
    await db.execute('DELETE FROM tasks WHERE id = ?', [id]);
    return;
  }
  
  const tasks = await getTasks();
  const filtered = tasks.filter(t => t.id !== id);
  await fs.writeFile(TASKS_FILE, JSON.stringify(filtered, null, 2));
}

// ==================== INITIALIZATION ====================

// Initialize default data if files don't exist (file system only)
export async function initializeData() {
  if (USE_DATABASE) {
    // Initialize database schema
    await db.initializeSchema();
    console.log('✅ TiDB schema initialized');
    return;
  }
  
  // File system initialization
  await ensureDataDir();

  const [projectsExists, tasksExists] = await Promise.all([
    fs.access(PROJECTS_FILE).then(() => true).catch(() => false),
    fs.access(TASKS_FILE).then(() => true).catch(() => false),
  ]);

  if (!projectsExists) {
    const defaultProjects: Project[] = [
      {
        id: 'p1',
        name: 'Website Redesign',
        team: 'Design',
        status: 'In Progress',
        deadline: '2026-03-15T00:00:00.000Z',
        progress: 65,
        budget: 50000,
        revenue: 75000,
        margin: 50,
        description: 'Complete redesign of company website',
      },
      {
        id: 'p2',
        name: 'Mobile App Development',
        team: 'Engineering',
        status: 'In Progress',
        deadline: '2026-04-01T00:00:00.000Z',
        progress: 40,
        budget: 120000,
        revenue: 200000,
        margin: 67,
        description: 'Native iOS and Android app development',
      },
      {
        id: 'p3',
        name: 'Marketing Campaign Q2',
        team: 'Marketing',
        status: 'Todo',
        deadline: '2026-04-15T00:00:00.000Z',
        progress: 0,
        budget: 30000,
        revenue: 100000,
        margin: 233,
        description: 'Q2 marketing campaign launch',
      },
    ];
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(defaultProjects, null, 2));
  }

  if (!tasksExists) {
    const defaultTasks: Task[] = [
      {
        id: 't1',
        projectId: 'p1',
        title: 'Design homepage mockup',
        assignee: 'Alice',
        status: 'Done',
        priority: 'High',
        dueDate: '2026-03-01T00:00:00.000Z',
        estimatedHours: 16,
        actualHours: 14,
        tags: ['design', 'ui'],
      },
      {
        id: 't2',
        projectId: 'p1',
        title: 'Implement responsive navigation',
        assignee: 'Bob',
        status: 'In Progress',
        priority: 'High',
        dueDate: '2026-03-10T00:00:00.000Z',
        estimatedHours: 8,
        actualHours: 4,
        tags: ['frontend', 'css'],
      },
      {
        id: 't3',
        projectId: 'p2',
        title: 'Setup project structure',
        assignee: 'Charlie',
        status: 'Done',
        priority: 'Critical',
        dueDate: '2026-02-20T00:00:00.000Z',
        estimatedHours: 4,
        actualHours: 3,
        tags: ['setup'],
      },
      {
        id: 't4',
        projectId: 'p2',
        title: 'Implement authentication flow',
        assignee: 'Bob',
        status: 'In Progress',
        priority: 'High',
        dueDate: '2026-03-15T00:00:00.000Z',
        estimatedHours: 20,
        actualHours: 8,
        tags: ['backend', 'auth'],
      },
      {
        id: 't5',
        projectId: 'p3',
        title: 'Define campaign goals',
        assignee: 'Diana',
        status: 'Todo',
        priority: 'Medium',
        dueDate: '2026-03-20T00:00:00.000Z',
        estimatedHours: 4,
        actualHours: 0,
        tags: ['planning'],
      },
    ];
    await fs.writeFile(TASKS_FILE, JSON.stringify(defaultTasks, null, 2));
  }
}

// Export for testing
export { USE_DATABASE };
