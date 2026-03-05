import { describe, it, expect, beforeEach, vi } from 'vitest';
import { promises as fs } from 'fs';

interface Project {
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

interface Task {
  id: string;
  projectId: string;
  title: string;
  assignee: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  tags?: string[];
}

// Mock implementations
const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Test Project 1',
    team: 'Team A',
    status: 'In Progress',
    deadline: '2026-04-01T00:00:00.000Z',
    progress: 50,
    budget: 10000,
    revenue: 5000,
    margin: 50,
    description: 'Test project 1',
  },
  {
    id: 'p2',
    name: 'Test Project 2',
    team: 'Team B',
    status: 'Todo',
    deadline: '2026-05-01T00:00:00.000Z',
    progress: 0,
    budget: 20000,
    revenue: 0,
    margin: 0,
    description: 'Test project 2',
  },
];

const mockTasks: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Task 1',
    assignee: 'John',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-03-15T00:00:00.000Z',
    estimatedHours: 8,
    actualHours: 4,
    tags: ['dev'],
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'Task 2',
    assignee: 'Jane',
    status: 'Todo',
    priority: 'Medium',
    dueDate: '2026-03-20T00:00:00.000Z',
    estimatedHours: 4,
    actualHours: 0,
    tags: ['test'],
  },
];

// Mock file operations
const ROOT = '/data/Organization/ToppLab/apps/taskflow';
const mockData: Record<string, any> = {
  [ROOT + '/data/projects.json']: JSON.stringify(mockProjects, null, 2),
  [ROOT + '/data/tasks.json']: JSON.stringify(mockTasks, null, 2),
};

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  const mocked = {
    ...actual,
    promises: {
      ...actual.promises,
      readFile: vi.fn(async (filePath: string) => {
        const key = filePath.toString();
        if (mockData[key]) return mockData[key];
        throw new Error(`File not found: ${key}`);
      }),
      writeFile: vi.fn(async (filePath: string, data: string) => {
        mockData[filePath.toString()] = data;
      }),
      access: vi.fn(async () => Promise.resolve()),
      mkdir: vi.fn(async () => {}),
    },
  };
  // Vitest complains if a default export is expected; provide one.
  return { ...mocked, default: mocked };
});

describe('Data Store', () => {
  beforeEach(() => {
    // Reset mock data before each test
    mockData[`${ROOT}/data/projects.json`] = JSON.stringify(mockProjects, null, 2);
    mockData[`${ROOT}/data/tasks.json`] = JSON.stringify(mockTasks, null, 2);
  });

  describe('getProjects', () => {
    it('should return array of projects', async () => {
      const { getProjects } = await import('@/lib/dataStore');
      const projects = await getProjects();
      
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBe(2);
      expect(projects[0].name).toBe('Test Project 1');
    });
  });

  describe('getTasks', () => {
    it('should return array of tasks', async () => {
      const { getTasks } = await import('@/lib/dataStore');
      const tasks = await getTasks();

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBe(2);
      expect(tasks[0].title).toBe('Task 1');
    });
  });

  // Note: dataStore currently exposes get/save/upsert only (no add/update/delete helpers)

  describe('upsertProjects', () => {
    it('should upsert multiple projects', async () => {
      const { upsertProjects } = await import('@/lib/dataStore');
      
      const projects: Project[] = [
        {
          id: 'p1',
          name: 'Updated P1',
          team: 'Team A',
          status: 'Done',
          deadline: '2026-04-01T00:00:00.000Z',
          progress: 100,
          budget: 10000,
          revenue: 10000,
          margin: 100,
          description: 'Updated project 1',
        },
        {
          id: 'p4',
          name: 'New P4',
          team: 'Team D',
          status: 'Todo',
          deadline: '2026-07-01T00:00:00.000Z',
          progress: 0,
          budget: 5000,
          revenue: 0,
          margin: 0,
          description: 'New project 4',
        },
      ];
      
      const result = await upsertProjects(projects);
      
      // Existing projects: p1, p2. Upsert updates p1 and adds p4 => total 3.
      expect(result.length).toBe(3);
      expect(vi.mocked(fs.writeFile)).toHaveBeenCalled();
    });
  });

  describe('upsertTasks', () => {
    it('should upsert multiple tasks', async () => {
      const { upsertTasks } = await import('@/lib/dataStore');
      
      const tasks: Task[] = [
        {
          id: 't1',
          projectId: 'p1',
          title: 'Updated T1',
          assignee: 'John',
          status: 'Done',
          priority: 'High',
          dueDate: '2026-03-15T00:00:00.000Z',
          estimatedHours: 8,
          actualHours: 8,
          tags: ['dev'],
        },
        {
          id: 't3',
          projectId: 'p2',
          title: 'New T3',
          assignee: 'Bob',
          status: 'Todo',
          priority: 'Low',
          dueDate: '2026-04-01T00:00:00.000Z',
          estimatedHours: 4,
          actualHours: 0,
          tags: ['new'],
        },
      ];
      
      const result = await upsertTasks(tasks);
      
      // Existing tasks: t1, t2. Upsert updates t1 and adds t3 => total 3.
      expect(result.length).toBe(3);
      expect(vi.mocked(fs.writeFile)).toHaveBeenCalled();
    });
  });
});
