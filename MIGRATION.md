# Migration Guide: Legacy → TaskFlow v2

## Prerequisites

- DATABASE_URL set in environment
- Legacy tables (`projects`, `tasks`) exist in database

## Steps

### 1. Push Prisma Schema
```bash
npx prisma db push
```

### 2. Seed Default Users
```bash
npm run db:seed
```

### 3. Migrate Legacy Data
```bash
npm run db:migrate-legacy
```

## What Gets Migrated

| Legacy Table | New Model | Notes |
|-------------|-----------|-------|
| projects | Project | Status mapped to enum |
| tasks | Task | Assignee → admin user, Status/Priority mapped |

## Mappings

### Project Status
- Todo → TODO
- In Progress → IN_PROGRESS
- Review → REVIEW
- Done → DONE
- Cancelled → CANCELLED

### Task Status
- Todo → TODO
- In Progress → IN_PROGRESS
- Review → REVIEW
- Done → DONE
- Blocked → BLOCKED

### Priority
- Low → LOW
- Medium → MEDIUM
- High → HIGH
- Critical → CRITICAL

## Troubleshooting

### Error: "Admin user not found"
Run seed first: `npm run db:seed`

### Error: "Legacy tables not found"
Make sure legacy data exists or skip migration (fresh start)
