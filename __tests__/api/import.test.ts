import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/dataStore', () => ({
  upsertProjects: vi.fn(),
  upsertTasks: vi.fn(),
}));

describe('/api/admin/import', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should reject unauthenticated requests', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue(null as any);

      const { POST } = await import('@/app/api/admin/import/route');
      
      const req = {
        json: async () => ({ type: 'projects', data: [] }),
      } as unknown as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    it('should reject empty data', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@taskflow.com', role: 'admin' },
      } as any);

      const { POST } = await import('@/app/api/admin/import/route');
      
      const req = {
        json: async () => ({ type: 'projects', data: [] }),
      } as unknown as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid or empty data');
    });

    it('should reject batch size larger than 1000', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@taskflow.com', role: 'admin' },
      } as any);

      const { POST } = await import('@/app/api/admin/import/route');
      
      const largeData = Array(1001).fill({ name: 'Test' });
      
      const req = {
        json: async () => ({ type: 'projects', data: largeData }),
      } as unknown as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Batch size too large');
    });

    it('should sanitize XSS payloads', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@taskflow.com', role: 'admin' },
      } as any);

      const { upsertProjects } = await import('@/lib/dataStore');
      vi.mocked(upsertProjects).mockResolvedValue([]);

      const { POST } = await import('@/app/api/admin/import/route');
      
      const xssPayload = '<script>alert("XSS")</script>';
      
      const req = {
        json: async () => ({
          type: 'projects',
          data: [{ name: xssPayload, team: 'Test' }],
        }),
      } as unknown as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      // Verify that upsertProjects was called with sanitized data
      const callArg = vi.mocked(upsertProjects).mock.calls[0][0];
      expect(callArg[0].name).not.toContain('<script>');
    });

    it('should validate project status', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@taskflow.com', role: 'admin' },
      } as any);

      const { upsertProjects } = await import('@/lib/dataStore');
      vi.mocked(upsertProjects).mockResolvedValue([]);

      const { POST } = await import('@/app/api/admin/import/route');
      
      const req = {
        json: async () => ({
          type: 'projects',
          data: [{ name: 'Test', status: 'Invalid Status' }],
        }),
      } as unknown as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      // Should default to 'Todo' for invalid status
      const callArg = vi.mocked(upsertProjects).mock.calls[0][0];
      expect(callArg[0].status).toBe('Todo');
    });

    it('should clamp progress between 0-100', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@taskflow.com', role: 'admin' },
      } as any);

      const { upsertProjects } = await import('@/lib/dataStore');
      vi.mocked(upsertProjects).mockResolvedValue([]);

      const { POST } = await import('@/app/api/admin/import/route');
      
      const req = {
        json: async () => ({
          type: 'projects',
          data: [{ name: 'Test', progress: 150 }],
        }),
      } as unknown as NextRequest;

      const response = await POST(req);
      
      // Should clamp to 100
      const callArg = vi.mocked(upsertProjects).mock.calls[0][0];
      expect(callArg[0].progress).toBe(100);
    });

    it('should prevent negative budget/revenue', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@taskflow.com', role: 'admin' },
      } as any);

      const { upsertProjects } = await import('@/lib/dataStore');
      vi.mocked(upsertProjects).mockResolvedValue([]);

      const { POST } = await import('@/app/api/admin/import/route');
      
      const req = {
        json: async () => ({
          type: 'projects',
          data: [{ name: 'Test', budget: -1000, revenue: -500 }],
        }),
      } as unknown as NextRequest;

      await POST(req);
      
      const callArg = vi.mocked(upsertProjects).mock.calls[0][0];
      expect(callArg[0].budget).toBe(0);
      expect(callArg[0].revenue).toBe(0);
    });

    it('should accept valid projects data', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@taskflow.com', role: 'admin' },
      } as any);

      const { upsertProjects } = await import('@/lib/dataStore');
      vi.mocked(upsertProjects).mockResolvedValue([{ id: 'p1', name: 'Test', team: 'A', status: 'Todo', deadline: '', progress: 0, budget: 0, revenue: 0, margin: 0 }] as any[]);

      const { POST } = await import('@/app/api/admin/import/route');
      
      const req = {
        json: async () => ({
          type: 'projects',
          data: [
            {
              name: 'Test Project',
              team: 'Team A',
              status: 'In Progress',
              progress: 50,
              budget: 10000,
              revenue: 5000,
            },
          ],
        }),
      } as unknown as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.imported).toBe(1);
    });

    it('should accept valid tasks data', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@taskflow.com', role: 'admin' },
      } as any);

      const { upsertTasks } = await import('@/lib/dataStore');
      vi.mocked(upsertTasks).mockResolvedValue([{ id: 't1', projectId: 'p1', title: 'Test', assignee: 'John', status: 'Todo', priority: 'Medium', dueDate: '', estimatedHours: 0, actualHours: 0 }] as any[]);

      const { POST } = await import('@/app/api/admin/import/route');
      
      const req = {
        json: async () => ({
          type: 'tasks',
          data: [
            {
              title: 'Test Task',
              projectId: 'p1',
              assignee: 'John',
              status: 'Todo',
              priority: 'High',
            },
          ],
        }),
      } as unknown as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.imported).toBe(1);
    });

    it('should reject invalid type', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@taskflow.com', role: 'admin' },
      } as any);

      const { POST } = await import('@/app/api/admin/import/route');
      
      const req = {
        json: async () => ({ type: 'invalid', data: [{ name: 'Test' }] }),
      } as unknown as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid type');
    });
  });
});
