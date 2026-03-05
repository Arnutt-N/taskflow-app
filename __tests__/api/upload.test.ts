import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('fs/promises', async () => {
  const actual = await vi.importActual<typeof import('fs/promises')>('fs/promises');
  return {
    ...actual,
    default: {
      ...actual,
      access: vi.fn(),
      mkdir: vi.fn(),
      writeFile: vi.fn(),
    },
  };
});

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-12345'),
}));

describe('/api/admin/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should reject unauthenticated requests', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue(null as any);

      const { POST } = await import('@/app/api/admin/upload/route');
      
      const mockFormData = new FormData();
      const mockFile = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      mockFormData.append('file', mockFile, 'test.xlsx');

      const req = {
        formData: async () => mockFormData,
      } as unknown as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    it('should reject requests without file', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@taskflow.com', role: 'admin' },
      } as any);

      const { POST } = await import('@/app/api/admin/upload/route');
      
      const mockFormData = new FormData();
      // No file appended

      const req = {
        formData: async () => mockFormData,
      } as unknown as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('No file provided');
    });

    it('should reject files larger than 10MB', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@taskflow.com', role: 'admin' },
      } as any);

      const { POST } = await import('@/app/api/admin/upload/route');
      
      // Create a mock file larger than 10MB
      const largeBuffer = new ArrayBuffer(15 * 1024 * 1024); // 15MB
      const mockFile = new Blob([largeBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      Object.defineProperty(mockFile, 'size', { value: 15 * 1024 * 1024 });
      
      const mockFormData = new FormData();
      mockFormData.append('file', mockFile, 'large.xlsx');

      const req = {
        formData: async () => mockFormData,
      } as unknown as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('File too large');
    });

    it('should reject invalid file types', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@taskflow.com', role: 'admin' },
      } as any);

      const { POST } = await import('@/app/api/admin/upload/route');
      
      // Create a text file (invalid)
      const mockFile = new Blob(['test content'], { type: 'text/plain' });
      Object.defineProperty(mockFile, 'size', { value: 100 });
      
      const mockFormData = new FormData();
      mockFormData.append('file', mockFile, 'test.txt');

      const req = {
        formData: async () => mockFormData,
      } as unknown as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid file type');
    });

    it('should accept valid Excel file', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@taskflow.com', role: 'admin' },
      } as any);

      const fsPromises = await import('fs/promises');
      vi.spyOn(fsPromises, 'access').mockRejectedValue(new Error('Dir not found'));
      vi.spyOn(fsPromises, 'mkdir').mockResolvedValue(undefined);
      vi.spyOn(fsPromises, 'writeFile').mockResolvedValue(undefined);

      const { POST } = await import('@/app/api/admin/upload/route');
      
      // Create a valid XLSX file (with PK header)
      const xlsxBuffer = new Uint8Array([0x50, 0x4B, 0x03, 0x04, ...new Array(100).fill(0)]);
      const mockFile = new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      Object.defineProperty(mockFile, 'size', { value: 104 });
      
      const mockFormData = new FormData();
      mockFormData.append('file', mockFile, 'test.xlsx');

      const req = {
        formData: async () => mockFormData,
      } as unknown as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.filename).toBe('test-uuid-12345.xlsx');
    });
  });
});
