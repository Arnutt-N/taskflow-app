import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next-auth
vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  getSession: vi.fn(),
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
}));

// Mock fs/promises
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    access: vi.fn(),
    mkdir: vi.fn(),
    unlink: vi.fn(),
  },
}));

// Mock path
vi.mock('path', () => ({
  default: {
    join: vi.fn((...args) => args.join('/')),
    resolve: vi.fn((...args) => args.join('/')),
    extname: vi.fn((filename) => {
      const ext = filename.split('.').pop();
      return ext ? `.${ext}` : '';
    }),
  },
}));
