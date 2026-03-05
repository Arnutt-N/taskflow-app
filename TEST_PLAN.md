# 🧪 Testing Plan - TaskFlow

**Date:** 2026-03-04  
**Version:** 1.0  
**Status:** Ready to Execute

---

## 📋 Test Categories

### 1. Unit Tests
### 2. Integration Tests
### 3. E2E Tests
### 4. Security Tests
### 5. Performance Tests

---

## 🔧 Setup

### Prerequisites
```bash
cd /data/Organization/ToppLab/apps/taskflow

# Install dependencies
npm install

# Install dev dependencies for testing
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @playwright/test
npm install -D eslint typescript
```

### Environment Setup
```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Generate secure NEXTAUTH_SECRET
# Node.js: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Edit .env.local
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

---

## ✅ Phase 1: Unit Tests

### Files to Test
| File | Test Coverage |
|------|---------------|
| `src/lib/dataStore.ts` | CRUD operations, data validation |
| `src/lib/utils.ts` | Utility functions |
| `src/types/index.ts` | Type guards |

### Test Commands
```bash
# Run unit tests
npm run test:unit

# Run with coverage
npm run test:coverage
```

### Sample Test Structure
```typescript
// __tests__/dataStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getProjects, addProject, updateProject, deleteProject } from '@/lib/dataStore';

describe('dataStore', () => {
  beforeEach(async () => {
    // Reset test data
  });

  describe('getProjects', () => {
    it('should return array of projects', async () => {
      const projects = await getProjects();
      expect(Array.isArray(projects)).toBe(true);
    });
  });

  describe('addProject', () => {
    it('should add new project', async () => {
      const project = {
        id: 'test-1',
        name: 'Test Project',
        team: 'Test Team',
        status: 'Todo',
        deadline: new Date().toISOString(),
        progress: 0,
        budget: 10000,
        revenue: 0,
      };
      const result = await addProject(project);
      expect(result).toBeDefined();
    });

    it('should validate required fields', async () => {
      // Test validation
    });
  });
});
```

---

## 🔗 Phase 2: Integration Tests

### API Endpoints to Test
| Endpoint | Method | Test Cases |
|----------|--------|------------|
| `/api/admin/upload` | POST | Valid file, invalid file, no auth, large file |
| `/api/admin/import` | POST | Valid data, invalid data, XSS payload, no auth |
| `/api/data/projects` | GET | Authenticated, unauthenticated |
| `/api/data/tasks` | GET | Authenticated, unauthenticated |

### Test Commands
```bash
# Run integration tests
npm run test:integration
```

### Sample API Test
```typescript
// __tests__/api/upload.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMockRequest } from '@/test/utils';
import { POST as uploadHandler } from '@/app/api/admin/upload/route';

describe('/api/admin/upload', () => {
  describe('POST', () => {
    it('should reject unauthenticated requests', async () => {
      const req = createMockRequest({ file: 'test.xlsx' });
      const res = await uploadHandler(req);
      expect(res.status).toBe(401);
    });

    it('should accept valid Excel file', async () => {
      // Mock authenticated request
      const req = createMockRequest({
        file: 'test.xlsx',
        authenticated: true,
      });
      const res = await uploadHandler(req);
      expect(res.status).toBe(200);
    });

    it('should reject files larger than 10MB', async () => {
      const req = createMockRequest({
        file: 'large.xlsx',
        size: 15 * 1024 * 1024, // 15MB
        authenticated: true,
      });
      const res = await uploadHandler(req);
      expect(res.status).toBe(400);
    });

    it('should reject non-Excel files', async () => {
      const req = createMockRequest({
        file: 'malicious.exe',
        authenticated: true,
      });
      const res = await uploadHandler(req);
      expect(res.status).toBe(400);
    });
  });
});
```

---

## 🎭 Phase 3: E2E Tests (Playwright)

### User Flows to Test
| Flow | Steps |
|------|-------|
| Login | Navigate → Enter credentials → Submit → Verify redirect |
| Upload Excel | Login → Navigate to admin → Select file → Upload → Verify success |
| Import Data | Login → Upload → Import → Verify data appears |
| View Dashboard | Login → View KPIs → Verify charts render |
| Filter Tasks | Login → Go to tasks → Apply filter → Verify results |

### Test Commands
```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e -- --ui

# Generate report
npm run test:e2e -- --reporter=html
```

### Sample E2E Test
```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.fill('input[type="email"]', 'admin@taskflow.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/upload');
    await expect(page).toHaveURL('http://localhost:3000/login');
  });
});
```

---

## 🔒 Phase 4: Security Tests

### Security Checklist
| Test | Status | Tool |
|------|--------|------|
| Authentication bypass | ⏳ Pending | Manual + Playwright |
| SQL Injection | ✅ N/A (No SQL) | - |
| XSS (Cross-Site Scripting) | ⏳ Pending | Manual + OWASP ZAP |
| CSRF (Cross-Site Request Forgery) | ⏳ Pending | Manual |
| File Upload Vulnerabilities | ⏳ Pending | Manual + Custom |
| Path Traversal | ⏳ Pending | Manual |
| Session Management | ⏳ Pending | Manual |
| Rate Limiting | ⏳ Pending | Artillery |

### Security Test Commands
```bash
# Run security audit
npm run audit

# Run OWASP ZAP (if installed)
zap-cli quick-scan --self-contained http://localhost:3000

# Run npm audit
npm audit --audit-level=high
```

### Manual Security Tests

#### 1. Authentication Bypass Test
```bash
# Try to access admin API without login
curl -X POST http://localhost:3000/api/admin/upload \
  -F "file=@test.xlsx"

# Expected: 401 Unauthorized
```

#### 2. XSS Test
```bash
# Try to inject XSS payload via import API
curl -X POST http://localhost:3000/api/admin/import \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "type": "projects",
    "data": [{
      "name": "<script>alert(\"XSS\")</script>",
      "team": "Test"
    }]
  }'

# Expected: Script tags should be sanitized
```

#### 3. File Upload Test
```bash
# Try to upload malicious file
curl -X POST http://localhost:3000/api/admin/upload \
  -H "Cookie: next-auth.session-token=..." \
  -F "file=@malicious.php"

# Expected: 400 Bad Request (invalid file type)
```

#### 4. Path Traversal Test
```bash
# Try to access files outside upload directory
curl -X POST http://localhost:3000/api/admin/upload \
  -H "Cookie: next-auth.session-token=..." \
  -F "file=@../../../etc/passwd"

# Expected: Should be rejected or sanitized
```

---

## ⚡ Phase 5: Performance Tests

### Performance Metrics
| Metric | Target | Tool |
|--------|--------|------|
| Page Load Time | < 2s | Lighthouse |
| API Response Time | < 500ms | Artillery |
| Time to Interactive | < 3s | Lighthouse |
| Bundle Size | < 500KB | Webpack Bundle Analyzer |

### Test Commands
```bash
# Run Lighthouse
npm run lighthouse

# Run load test with Artillery
artillery run --target http://localhost:3000 load-test.yml

# Analyze bundle
npm run analyze
```

### Load Test Configuration
```yaml
# load-test.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100

scenarios:
  - name: "Browse Dashboard"
    flow:
      - get:
          url: "/"
      - get:
          url: "/api/data/projects"
      - get:
          url: "/api/data/tasks"
```

---

## 📊 Test Execution Schedule

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1: Unit Tests | 2-3 hours | 🔴 High |
| Phase 2: Integration Tests | 3-4 hours | 🔴 High |
| Phase 3: E2E Tests | 4-6 hours | 🟡 Medium |
| Phase 4: Security Tests | 2-3 hours | 🔴 High |
| Phase 5: Performance Tests | 2-3 hours | 🟢 Low |

**Total Estimated Time:** 13-19 hours

---

## 📝 Test Report Template

```markdown
## Test Results Summary

**Date:** YYYY-MM-DD  
**Tester:** [Name]  
**Build:** [Version]

### Pass Rate
- Unit Tests: X/Y (Z%)
- Integration Tests: X/Y (Z%)
- E2E Tests: X/Y (Z%)
- Security Tests: X/Y (Z%)

### Critical Issues Found
1. [Issue description]
2. [Issue description]

### Recommendations
1. [Recommendation]
2. [Recommendation]
```

---

## 🚀 Next Steps

1. ✅ **Security fixes applied** (auth, file validation, input sanitization)
2. ⏳ **Install test dependencies**
3. ⏳ **Write unit tests**
4. ⏳ **Write integration tests**
5. ⏳ **Write E2E tests**
6. ⏳ **Run security tests**
7. ⏳ **Run performance tests**
8. ⏳ **Generate test report**

---

**Ready to start testing!** 🎯
