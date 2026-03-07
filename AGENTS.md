# TaskFlow Agent Guidelines

> **Last Updated:** 2026-03-07  
> **Project:** TaskFlow v2 - Project & Task Management Dashboard  
> **Stack:** Next.js 16 + React 19 + TypeScript + Prisma + MySQL

---

## 📋 Table of Contents

1. [Quick Start for New Agents](#quick-start-for-new-agents)
2. [Pre-Flight Checklists](#pre-flight-checklists)
3. [Project Overview](#project-overview)
4. [Environment Setup](#environment-setup)
5. [Build, Test & Quality Commands](#build-test--quality-commands)
6. [Git Workflow](#git-workflow)
7. [Architecture Decisions](#architecture-decisions)
8. [Code Style Guidelines](#code-style-guidelines)
9. [Project Structure](#project-structure)
10. [Common Tasks & Patterns](#common-tasks--patterns)
11. [Security & Authentication](#security--authentication)
12. [Performance Guidelines](#performance-guidelines)
13. [Accessibility (a11y)](#accessibility-a11y)
14. [Troubleshooting](#troubleshooting)
15. [Common Pitfalls](#common-pitfalls)

---

## Quick Start for New Agents

### 1. Clone & Install
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials
```

### 2. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations (if existing database)
npx prisma migrate deploy

# Or start fresh with seed data
npx prisma migrate dev --name init
npm run seed  # If available
```

### 3. Verify Everything Works
```bash
# Run type check
npm run type-check

# Run unit tests
npm test

# Start dev server
npm run dev
# Open http://localhost:3000
```

### 4. Before Your First Commit
See [Pre-Flight Checklists](#pre-flight-checklists) → Before Submitting Work

---

## Pre-Flight Checklists

### ✅ Before Starting a Task

- [ ] Pull latest changes: `git pull origin main`
- [ ] Create a feature branch: `git checkout -b feature/description`
- [ ] Run tests to ensure baseline is green: `npm test`
- [ ] Read relevant code sections (similar features, shared components)
- [ ] Check if similar patterns exist in the codebase

### ✅ Before Submitting Work

- [ ] **Type Check:** `npm run type-check` (must pass)
- [ ] **Lint:** `npm run lint` (must pass)
- [ ] **Unit Tests:** `npm test` (all must pass)
- [ ] **E2E Tests:** `npx playwright test` (if you changed UI flows)
- [ ] Manual testing in browser (happy path + edge cases)
- [ ] Console is free of errors/warnings
- [ ] No `console.log` statements left (use `console.error` for errors only)
- [ ] No `.only` or `.skip` in tests
- [ ] No `// TODO` or `// FIXME` left (create tickets instead)
- [ ] Commit message follows format: `type: description` (e.g., `feat: add project filter`)

---

## Project Overview

| Aspect | Technology |
|--------|------------|
| **Framework** | Next.js 16 (App Router) |
| **React** | React 19 |
| **Language** | TypeScript 5.6 (Strict Mode) |
| **Database** | MySQL with Prisma ORM |
| **Authentication** | NextAuth v5 (Auth.js) |
| **Styling** | Tailwind CSS 3.4 |
| **State Management** | React Query (TanStack) + React Hooks |
| **Testing** | Vitest (unit) + Playwright (E2E) |
| **Toast Notifications** | Sonner |
| **Drag & Drop** | @dnd-kit/core + @hello-pangea/dnd |
| **Excel Processing** | xlsx |
| **Date Handling** | date-fns |
| **Icons** | lucide-react |

### Role Hierarchy & Permissions

| Role | Level | Typical Permissions |
|------|-------|---------------------|
| `ADMIN` | 5 | Full access: create/delete projects, manage users, all reports |
| `PM` (Project Manager) | 4 | Create projects, assign tasks, view all reports |
| `LEAD` (Team Lead) | 3 | Manage team tasks, view team reports |
| `STAFF` | 2 | Update assigned tasks, limited reports |
| `USER` | 1 | View-only or basic task updates |

> **Note:** Always use `requireRole()` or `hasRole()` from `@/lib/auth-guards` for authorization checks.

---

## Environment Setup

### Required Environment Variables

```bash
# Database (Required)
DATABASE_URL="mysql://user:password@host:port/database?sslaccept=strict"

# NextAuth (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-min-32-characters-long

# Optional: Legacy database for migration scripts
LEGACY_DATABASE_URL=""
```

### Setting Up Local Development

1. **MySQL Database:** Ensure MySQL 8.0+ is running locally or use TiDB Cloud
2. **Generate Prisma Client:** Run `npx prisma generate` after any schema change
3. **VS Code Extensions Recommended:**
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - Prisma

---

## Build, Test & Quality Commands

### Development
```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server
```

### Code Quality (MUST PASS before commit)
```bash
npm run lint         # ESLint check
npm run type-check   # TypeScript compiler (no emit)
```

### Unit Tests (Vitest)
```bash
npm test             # Run all tests once
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report

# Run specific tests
npx vitest run __tests__/utils.test.ts
npx vitest run -t "formatNumber"  # Run by pattern
```

### E2E Tests (Playwright)
```bash
npx playwright test                    # Run all E2E tests
npx playwright test e2e/auth.spec.ts   # Single file
npx playwright test --headed           # Visible browser
npx playwright test --debug            # Debug mode
npx playwright test --ui               # Interactive UI mode
```

---

## Git Workflow

### Branch Naming
- Features: `feature/add-user-profile`
- Bug fixes: `fix/login-redirect-issue`
- Hotfixes: `hotfix/critical-security-patch`
- Refactoring: `refactor/api-route-handlers`

### Commit Message Format
```
type: description in present tense

Optional body with more details
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Guidelines
1. Keep PRs focused on a single concern
2. Include "Test Plan" in PR description
3. Ensure all CI checks pass
4. Request review from at least one team member
5. Squash merge when approved

---

## Architecture Decisions

### Server Actions vs API Routes

| Use Case | Recommended Approach | Example |
|----------|---------------------|---------|
| Form submissions from Server Components | Server Actions | Contact form, settings update |
| File uploads | API Routes | Excel import, image upload |
| Real-time data fetching | React Query + API Routes | Dashboard data, lists |
| External API proxying | API Routes | Third-party integrations |
| Complex auth flows | API Routes | OAuth callbacks |
| Mutations requiring revalidation | Server Actions | Create project, update task |

### Data Fetching Patterns

#### Option 1: React Query (Recommended for Client Components)
```typescript
// hooks/useProjects.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProjectInput) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created');
    },
  });
};
```

#### Option 2: Direct fetch (Simple cases)
```typescript
// For one-off data fetching in useEffect
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/data')
    .then(r => r.json())
    .then(setData);
}, []);
```

### Toast Notifications (Sonner)

```typescript
import { toast } from 'sonner';

// Basic toast
toast.success('Operation completed!');
toast.error('Something went wrong');
toast.info('Heads up!');
toast.warning('Please check your input');

// With loading state
const toastId = toast.loading('Processing...');
try {
  await doSomething();
  toast.success('Done!', { id: toastId });
} catch {
  toast.error('Failed', { id: toastId });
}

// Promise-based (automatic loading/success/error)
toast.promise(saveData(), {
  loading: 'Saving...',
  success: 'Saved successfully',
  error: 'Failed to save',
});
```

### Drag & Drop Patterns

The project uses **@dnd-kit** for sortable lists and **@hello-pangea/dnd** for complex drag scenarios:

```typescript
// For simple sortable lists (dnd-kit)
import { useSortable } from '@dnd-kit/sortable';

// For complex board layouts (@hello-pangea/dnd)
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
```

---

## Code Style Guidelines

### File Organization
```typescript
// Add file path comment at the very top
// lib/utils.ts
// components/tasks/TaskCard.tsx
// app/api/projects/route.ts

'use client'; // If using hooks or browser APIs
```

### Import Order
1. React/Next.js imports
2. Third-party libraries
3. Internal aliases (`@/`)
4. Relative imports
5. Types (use `type` keyword)

```typescript
import { useState, useEffect } from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';
import { cn } from '@/lib/utils';

import type { Project, Task } from '@/types';
```

### TypeScript Best Practices

| Rule | Example |
|------|---------|
| Use interfaces for object shapes | `interface UserProps { name: string }` |
| Use `type` for unions/primitives | `type Status = 'active' \| 'inactive'` |
| Explicit return types on exports | `export function formatDate(d: Date): string` |
| Avoid `any` - use `unknown` | `function handleError(e: unknown)` |
| Null checks | `if (value === null)`, optional chaining `obj?.prop` |
| Type guards | `if (typeof x === 'string')` |

### React Components Pattern

```typescript
'use client'; // If needed

interface TaskCardProps {
  task: Task;
  onStatusChange?: (id: string, status: TaskStatus) => void;
}

export const TaskCard = ({ task, onStatusChange }: TaskCardProps) => {
  const handleClick = () => {
    onStatusChange?.(task.id, 'Done');
  };

  return (
    <div className={cn('p-4 rounded-lg', task.priority === 'High' && 'border-red-500')}>
      {/* Component JSX */}
    </div>
  );
};
```

### API Routes Pattern

```typescript
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';
import { applyRateLimit } from '@/lib/rateLimit';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/resource
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check auth and roles
    const forbidden = requireRole(session, ['ADMIN', 'PM']);
    if (forbidden) return forbidden;
    
    // Rate limiting
    const rateLimit = await applyRateLimit(req, 'api');
    if (rateLimit) return rateLimit;

    const data = await prisma.resource.findMany();
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/resource error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
```

### Error Handling Standards

| Status | Use Case |
|--------|----------|
| 400 | Bad request (validation errors) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (duplicate data) |
| 422 | Unprocessable entity (invalid format) |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |

### Database (Prisma) Patterns

```typescript
// Singleton client: always import from @/lib/prisma
import { prisma } from '@/lib/prisma';

// Use transactions for related operations
await prisma.$transaction([
  prisma.project.create({ data: projectData }),
  prisma.activityLog.create({ data: logData }),
]);

// Include relations explicitly
const project = await prisma.project.findUnique({
  where: { id },
  include: { tasks: true, members: true },
});

// Use select for performance on large datasets
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
});
```

### Styling (Tailwind CSS)

```typescript
import { cn } from '@/lib/utils';

// Use cn() for conditional classes
className={cn(
  'px-4 py-2 rounded-lg transition-colors',
  variant === 'primary' && 'bg-indigo-600 text-white hover:bg-indigo-700',
  variant === 'secondary' && 'bg-slate-200 text-slate-800',
  isDisabled && 'opacity-50 cursor-not-allowed',
  className // Allow override
)}
```

**Color Palette:**
- Primary: `indigo` (buttons, links, active states)
- Success: `emerald` (completed, positive)
- Danger: `rose` (errors, deletions)
- Warning: `amber` (warnings, attention)
- Neutral: `slate` (text, borders, backgrounds)

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `StatCard.tsx`, `ProjectList.tsx` |
| Utilities | camelCase | `formatNumber.ts`, `cn.ts` |
| Constants | SCREAMING_SNAKE_CASE | `ITEMS_PER_PAGE` |
| API routes | lowercase | `/api/projects/route.ts` |
| Hooks | camelCase with use prefix | `useDashboardData.ts` |
| Types/Interfaces | PascalCase | `Project`, `TaskStatus` |

---

## Project Structure

```
src/
  app/                    # Next.js App Router
    api/                  # API route handlers
      projects/
        route.ts          # GET, POST /api/projects
      tasks/
        route.ts          # GET, POST /api/tasks
    (dashboard)/          # Route groups (no URL segment)
      page.tsx            # Dashboard home
      layout.tsx          # Dashboard layout
    globals.css           # Global styles
    layout.tsx            # Root layout
    page.tsx              # Landing page
  
  components/             # React components
    ui/                   # Generic UI (Button, Card, Modal)
    dashboard/            # Dashboard-specific
    tasks/                # Task-related
    projects/             # Project-related
    layout/               # Header, Sidebar, Footer
  
  hooks/                  # Custom React hooks
    useDashboardData.ts
  
  lib/                    # Utilities & shared logic
    prisma.ts             # Prisma client singleton
    utils.ts              # cn(), formatters
    auth-guards.ts        # Role checking utilities
    rateLimit.ts          # Rate limiting
    constants.ts          # App constants
  
  types/                  # TypeScript definitions
    index.ts              # Main type exports

prisma/
  schema.prisma           # Database schema

__tests__/                # Unit tests
  setup.ts                # Test configuration
  *.test.ts               # Test files

e2e/                      # Playwright E2E tests
  *.spec.ts               # E2E test files
  global-setup.ts         # E2E setup
```

---

## Common Tasks & Patterns

### Adding a New API Endpoint

1. Create file: `src/app/api/<resource>/route.ts`
2. Export `GET`, `POST`, `PUT`, `DELETE` as needed
3. Add `await auth()` check
4. Use `requireRole()` for authorization
5. Wrap in try/catch
6. Return `NextResponse.json()`

### Creating a New Component

1. Create in appropriate `src/components/` subdirectory
2. Add `'use client'` if using hooks/browser APIs
3. Define `ComponentNameProps` interface
4. Export named component (not default)
5. Use `cn()` for conditional styling

### Running Database Migrations

```bash
npx prisma migrate dev --name add_user_profile  # Create migration
npx prisma generate                              # Generate client
npx prisma migrate deploy                        # Deploy to production
npx prisma studio                                # Open database GUI
```

### Form Handling Pattern

```typescript
'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface FormData {
  name: string;
  email: string;
}

export const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData) as FormData;
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error('Failed to submit');
      
      toast.success('Message sent!');
      e.currentTarget.reset();
    } catch (err) {
      toast.error('Failed to send message');
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Excel Import/Export Pattern

```typescript
// Export
const handleExport = async () => {
  const res = await fetch('/api/export/projects');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `projects_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

// Import
const handleImport = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'projects');
  
  const res = await fetch('/api/import', {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) throw new Error('Import failed');
  return res.json();
};
```

---

## Security & Authentication

### Authentication Checklist
- [ ] Always `await auth()` in API routes and Server Actions
- [ ] Use `requireRole()` for role-based access control
- [ ] Apply rate limiting to sensitive endpoints
- [ ] Validate all user input (Zod recommended)
- [ ] Never expose internal errors to client
- [ ] Never commit `.env` files

### Rate Limiting Usage

```typescript
import { applyRateLimit, rateLimiters } from '@/lib/rateLimit';

// In API route:
const rateLimit = await applyRateLimit(req, 'api');    // 100/min
const rateLimit = await applyRateLimit(req, 'auth');   // 5/15min
const rateLimit = await applyRateLimit(req, 'upload'); // 10/min
const rateLimit = await applyRateLimit(req, 'import'); // 20/min

if (rateLimit) return rateLimit; // Returns 429 if limited
```

### Security Best Practices

1. **Input Validation:** Always validate on server side
2. **SQL Injection:** Use Prisma (parameterized queries) - never string concatenation
3. **XSS Prevention:** React escapes by default, but sanitize if using `dangerouslySetInnerHTML`
4. **CSRF Protection:** NextAuth handles this automatically
5. **File Uploads:** Validate file types, limit sizes, scan for malware

---

## Performance Guidelines

### Do's ✅
- Use `React.memo()` for expensive renders
- Use `useMemo()` for expensive calculations
- Use `useCallback()` for function props to memoized children
- Implement pagination for large lists (see `ITEMS_PER_PAGE`)
- Use React Query for caching server state
- Lazy load heavy components: `const Heavy = dynamic(() => import('./Heavy'))`
- Use Prisma `select` to fetch only needed fields

### Don'ts ❌
- Don't fetch data in render loops
- Don't use `useEffect` for data fetching (use React Query)
- Don't store large datasets in React state
- Don't fetch all records and filter client-side
- Don't ignore React Query cache invalidation

### Bundle Size
- Import icons individually: `import { Plus } from 'lucide-react'`
- Avoid importing entire libraries when possible
- Use dynamic imports for route-specific heavy dependencies

---

## Accessibility (a11y)

### Required Practices

| Element | Requirement |
|---------|-------------|
| Buttons | Must have `aria-label` if no visible text |
| Images | Must have `alt` text (empty for decorative) |
| Forms | Labels must be associated with inputs |
| Icons | Must have `aria-hidden` or accessible label |
| Error messages | Must use `aria-live="polite"` |
| Focus | Must be visible, logical tab order |

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Modal dialogs must trap focus
- `Escape` key should close modals/dropdowns

### Testing Accessibility
```bash
# Run axe-core checks in Playwright tests
# Use browser devtools accessibility panel
# Test with keyboard-only navigation
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `prisma is not defined` | Run `npx prisma generate` |
| Type errors in tests | Check `__tests__/setup.ts` mocks |
| E2E tests failing | Ensure dev server is running on :3000 |
| `Cannot find module '@/'` | Check tsconfig.json paths |
| Hot reload not working | Restart dev server, check for syntax errors |
| Database connection timeout | Check `DATABASE_URL`, ensure SSL settings |
| `auth()` returns null in test | Mock `next-auth` in test setup |

### Debug Mode

```bash
# Debug Vitest tests
npx vitest run --reporter=verbose

# Debug Playwright
npx playwright test --debug

# Debug Next.js
NODE_OPTIONS='--inspect' npm run dev
```

### Getting Help

1. Check this AGENTS.md first
2. Look at similar code in the codebase
3. Check TEST_PLAN.md for testing guidance
4. Review ARCHITECTURE.md for system design

---

## Common Pitfalls

### ❌ Don't: Use `any` Type
```typescript
// Bad
const handleData = (data: any) => { ... }

// Good
const handleData = (data: unknown) => {
  if (typeof data === 'string') { ... }
}
```

### ❌ Don't: Expose Sensitive Data in Errors
```typescript
// Bad
return NextResponse.json({ error: error.message }, { status: 500 });

// Good
console.error('Context:', error);
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
```

### ❌ Don't: Forget Error Boundaries
Always handle errors in async operations, especially in event handlers.

### ❌ Don't: Mix Server and Client Code
- Server Components: No `'use client'`, can access database directly
- Client Components: `'use client'`, use API routes or React Query

### ❌ Don't: Ignore Loading States
Always show loading feedback for async operations (spinners, skeletons, or toast).

### ❌ Don't: Hardcode Thai Locale
Use the utility functions in `utils.ts`:
```typescript
// Good
formatNumber(amount);        // Uses 'th-TH' locale
formatCurrency(amount);      // Adds ฿ suffix
getTodayLabel();             // Thai date format
```

---

## Important Notes

- **Locale:** Thai (th-TH) for all number/date formatting
- **Currency:** Thai Baht (฿)
- **Timezone:** Store UTC in database, display in local time
- **Current User:** Reference `CURRENT_USER` from constants for demo/development
- **Testing:** Skip rate limiting in test environment (`PLAYWRIGHT=1` or `NODE_ENV=test`)

---

> **Remember:** When in doubt, follow existing patterns in the codebase. Consistency is more important than perfection.
