# 🧪 Testing & Security Plan - TaskFlow

**Created:** 2026-03-05  
**By:** Lita  
**Status:** Planning Phase

---

## 📋 Overview

แผนนี้ครอบคลุม 3 ส่วนหลัก:
1. **Software Testing** - Unit & Integration Tests (Vitest)
2. **Security Testing** - Vulnerability Assessment & Fixes
3. **Playwright E2E Testing** - End-to-End User Flows

---

## 1️⃣ Software Testing Plan (Vitest)

### 🎯 Goals
- Unit test coverage ≥ 80% สำหรับ business logic
- Integration tests สำหรับ API routes
- Fast, reliable, isolated tests

### 📁 Test Structure

```
__tests__/
├── setup.ts                    # Global test setup
├── dataStore.test.ts           # ✅ มีแล้ว
├── utils.test.ts               # ✅ มีแล้ว
├── api/
│   ├── data.test.ts            # ⏳ /api/data endpoint
│   ├── upload.test.ts          # ⏳ /api/admin/upload
│   └── import.test.ts          # ⏳ /api/admin/import
├── components/
│   ├── StatusBadge.test.tsx    # ⏳ UI component
│   ├── StatCard.test.tsx       # ⏳ Dashboard card
│   └── Pagination.test.tsx     # ⏳ Pagination logic
└── hooks/
    └── useDashboardData.test.ts # ⏳ Data fetching hook
```

### ✅ Current Status

| File | Status | Coverage |
|------|--------|----------|
| `dataStore.test.ts` | ✅ Done | CRUD, upsert |
| `utils.test.ts` | ✅ Done | Utility functions |
| `api/*.test.ts` | ⏳ Pending | API routes |

### 📝 Tests to Add

#### Phase 1: Unit Tests (2-3 hours)

```typescript
// __tests__/components/StatusBadge.test.tsx
describe('StatusBadge', () => {
  it('renders correct color for each status', () => {
    // Done = green, In Progress = blue, Todo = gray
  });
  
  it('renders correct color for each priority', () => {
    // Critical = red, High = orange, Medium = yellow, Low = gray
  });
});

// __tests__/hooks/useDashboardData.test.ts
describe('useDashboardData', () => {
  it('fetches and merges projects + tasks', async () => {
    // Mock API response, verify merged data
  });
  
  it('calculates KPIs correctly', () => {
    // totalCost, totalRevenue, totalProfit, task stats
  });
});
```

#### Phase 2: Integration Tests (3-4 hours)

```typescript
// __tests__/api/data.test.ts
describe('/api/data', () => {
  it('returns projects and tasks', async () => {
    // GET /api/data → { projects, tasks }
  });
  
  it('returns 401 when not authenticated', async () => {
    // Without session → 401
  });
});

// __tests__/api/upload.test.ts
describe('/api/admin/upload', () => {
  it('rejects unauthenticated requests', async () => {
    // No session → 401
  });
  
  it('accepts valid Excel file', async () => {
    // With session + valid .xlsx → 200
  });
  
  it('rejects invalid file types', async () => {
    // .exe, .php → 400
  });
  
  it('rejects files > 10MB', async () => {
    // Large file → 400
  });
});
```

### 🔧 Test Commands

```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Run integration tests
npm run test:integration
```

---

## 2️⃣ Security Testing Plan

### 🎯 Goals
- แก้ไข HIGH priority issues ทั้งหมด
- แก้ไข MEDIUM priority issues ก่อน production
- Security regression tests

### 🔴 HIGH Priority (Immediate)

| Issue | File | Action | Status |
|-------|------|--------|--------|
| No API auth check | `api/admin/upload/route.ts` | Add `auth()` check | ⏳ |
| No API auth check | `api/admin/import/route.ts` | Add `auth()` check | ⏳ |
| File type bypass | `api/admin/upload/route.ts` | Validate magic bytes | ⏳ |

### 🟡 MEDIUM Priority (Before Production)

| Issue | File | Action | Status |
|-------|------|--------|--------|
| No file size limit | `api/admin/upload/route.ts` | Add 10MB limit | ⏳ |
| No input sanitization | `api/admin/import/route.ts` | Sanitize XSS | ⏳ |
| Path traversal risk | `lib/dataStore.ts` | Validate paths | ⏳ |

### 🟢 LOW Priority (Nice to Have)

| Issue | Action | Status |
|-------|--------|--------|
| Hardcoded credentials | Change defaults, env vars | ⏳ |
| No rate limiting | Add rate limiter | ⏳ |
| Missing security headers | Configure in `next.config.mjs` | ⏳ |

### 🛠️ Security Fixes Implementation

#### Fix 1: API Authentication

```typescript
// src/app/api/admin/upload/route.ts
import { auth } from '@/auth';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Continue with upload...
}
```

#### Fix 2: File Validation

```typescript
// src/lib/fileValidation.ts
const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function validateExcelFile(file: File): Promise<{ valid: boolean; error?: string }> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Max: 10MB' };
  }
  
  // Check extension
  if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    return { valid: false, error: 'Invalid file type. Only .xlsx and .xls allowed' };
  }
  
  // Check MIME type (can be spoofed, but good first line)
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid MIME type' };
  }
  
  return { valid: true };
}
```

#### Fix 3: Input Sanitization

```typescript
// src/lib/sanitize.ts
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

export function sanitizeProject(project: any): Partial<Project> {
  return {
    id: sanitizeString(project.id),
    name: sanitizeString(project.name),
    team: sanitizeString(project.team),
    status: ['In Progress', 'Planning', 'Completed', 'Todo'].includes(project.status) 
      ? project.status 
      : 'Todo',
    deadline: sanitizeString(project.deadline),
    progress: Math.max(0, Math.min(100, Number(project.progress) || 0)),
    budget: Math.max(0, Number(project.budget) || 0),
    revenue: Math.max(0, Number(project.revenue) || 0),
  };
}
```

### 🧪 Security Test Cases

```typescript
// __tests__/security/upload.test.ts
describe('Upload Security', () => {
  test('rejects unauthenticated requests', async () => {
    const res = await fetch('/api/admin/upload', { method: 'POST' });
    expect(res.status).toBe(401);
  });
  
  test('rejects .php files disguised as .xlsx', async () => {
    const file = new File(['<?php evil(); ?>'], 'malicious.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    // Should reject based on content analysis
  });
  
  test('rejects files > 10MB', async () => {
    // Create large file, expect 400
  });
});

// __tests__/security/xss.test.ts
describe('XSS Prevention', () => {
  test('sanitizes project names on import', async () => {
    const malicious = { name: '<script>alert("xss")</script>' };
    const result = sanitizeProject(malicious);
    expect(result.name).not.toContain('<script>');
  });
});
```

---

## 3️⃣ Playwright E2E Testing Plan

### 🎯 Goals
- Stable, non-flaky tests
- Isolated test data per run
- Cover critical user flows

### ✅ Current Status

| Spec | Tests | Status |
|------|-------|--------|
| `auth.spec.ts` | 3 | ✅ Stable |
| `dashboard.spec.ts` | 3 | ✅ Stable |
| `projects.spec.ts` | 3 | ✅ Stable |
| `tasks.spec.ts` | 8 | ⚠️ Flaky (needs data) |
| `excel-import.spec.ts` | 3 | ✅ Stable |

### 🔧 Test Data Strategy

**Current Setup:**
- `global-setup.ts` calls `/api/test/reset` to seed mock data
- Data stored in `.playwright-data/` (isolated from dev data)
- `TASKFLOW_DATA_DIR=.playwright-data` env var

**Issue:** Tasks tests sometimes fail when data is empty

**Solution:** Ensure global setup always seeds data before tests

```typescript
// e2e/global-setup.ts
async function globalSetup() {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  const context = await playwrightRequest.newContext({ baseURL });

  // Wait for server to be ready
  let retries = 5;
  while (retries > 0) {
    try {
      const res = await context.post('/api/test/reset');
      if (res.ok()) {
        console.log('✅ Test data seeded successfully');
        break;
      }
    } catch (e) {
      retries--;
      if (retries === 0) throw e;
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  await context.dispose();
}
```

### 📋 E2E Test Cases

#### Authentication Flow (auth.spec.ts)
| Test | Status | Description |
|------|--------|-------------|
| Login success | ✅ | Valid credentials → redirect to / |
| Login failure | ✅ | Invalid credentials → error message |
| Protected route redirect | ✅ | Unauthenticated → redirect to /login |

#### Dashboard Flow (dashboard.spec.ts)
| Test | Status | Description |
|------|--------|-------------|
| View KPIs | ✅ | Display stats cards |
| View charts | ✅ | Charts render correctly |
| Navigation | ✅ | Sidebar navigation works |

#### Projects Flow (projects.spec.ts)
| Test | Status | Description |
|------|--------|-------------|
| View projects list | ✅ | Display project cards |
| Filter by status | ✅ | Status filter works |
| View project details | ✅ | Click card → details |

#### Tasks Flow (tasks.spec.ts)
| Test | Status | Description |
|------|--------|-------------|
| Navigate to tasks | ⚠️ | Click "All Tasks" button |
| Display table | ⚠️ | Table headers visible |
| Search filter | ⚠️ | Search by task name |
| Status filter | ⚠️ | Filter by status |
| Priority filter | ⚠️ | Filter by priority |
| Priority badges | ⚠️ | Badge colors correct |
| Status badges | ⚠️ | Badge colors correct |
| Assignee avatars | ⚠️ | Avatar visible |

#### Excel Import Flow (excel-import.spec.ts)
| Test | Status | Description |
|------|--------|-------------|
| Navigate to upload | ✅ | Admin → Upload page |
| Upload valid file | ✅ | Success message |
| Import data | ✅ | Data appears in dashboard |

### 🔧 Stability Improvements

```typescript
// e2e/tasks.spec.ts - Improved version
test.describe('Tasks Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@taskflow.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    
    // Navigate to tasks and wait for data
    await page.getByRole('button', { name: 'All Tasks' }).click();
    await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
    
    // Wait for table to have at least one row
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display tasks table with data', async ({ page }) => {
    // Now we know data exists
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('should filter tasks by search', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search tasks...');
    await searchInput.fill('update');
    
    // Wait for filter to apply
    await expect(page.locator('tbody tr')).toHaveCount(1, { timeout: 5000 });
  });
});
```

### 📊 Test Configuration

```typescript
// playwright.config.ts - Optimized for stability
export default defineConfig({
  globalSetup: './e2e/global-setup.ts',
  testDir: './e2e',
  
  // Stability settings
  timeout: 30 * 1000,
  expect: { timeout: 10 * 1000 },
  fullyParallel: false,  // Sequential for stability
  workers: 1,            // Single worker
  
  // Retry in CI
  retries: process.env.CI ? 2 : 0,
  
  // Trace on failure
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  
  // Isolated data directory
  webServer: {
    command: 'PORT=3000 PLAYWRIGHT=1 TASKFLOW_DATA_DIR=.playwright-data npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
});
```

---

## 📅 Implementation Timeline

### Week 1: Security Fixes
| Day | Task |
|-----|------|
| 1 | Add auth checks to API routes |
| 2 | Implement file validation |
| 3 | Add input sanitization |
| 4 | Add file size limits |
| 5 | Security testing + fixes verification |

### Week 2: Testing
| Day | Task |
|-----|------|
| 1 | Fix flaky E2E tests |
| 2 | Add missing unit tests |
| 3 | Add API integration tests |
| 4 | Run full test suite |
| 5 | Document results, create report |

---

## ✅ Acceptance Criteria

### Security
- [ ] All HIGH priority issues resolved
- [ ] All MEDIUM priority issues resolved
- [ ] Security tests passing

### Testing
- [ ] Unit test coverage ≥ 80%
- [ ] All API routes have integration tests
- [ ] All E2E tests passing (35/35)
- [ ] No flaky tests

### Documentation
- [ ] Test results documented
- [ ] Security audit updated
- [ ] Runbook for CI/CD

---

## 🚀 Commands Summary

```bash
# Security
npm run audit:security

# Unit Tests
npm run test:unit
npm run test:coverage

# Integration Tests
npm run test:integration

# E2E Tests
npm run test:e2e
npm run test:e2e:ui

# All Tests
npm run test && npm run test:e2e
```

---

**Next Step:** เริ่มแก้ Security HIGH priority issues ก่อนค่ะพี่ท้อป! 🔐
