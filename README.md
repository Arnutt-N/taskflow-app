# TaskFlow - Executive & Operations Dashboard

Modern task and project management dashboard built with **Next.js 16**, **React 19**, TypeScript, and TailwindCSS.

## ✨ Features

- **Executive Dashboard** - KPIs, financial tracking, project performance charts
- **Projects Portfolio** - Visual project cards with progress, budget, and margin tracking
- **Tasks Management** - Full task table with filters, search, pagination
- **📤 Excel Import** - Upload and import projects/tasks from Excel files
- **🔐 Authentication** - Login/logout with role-based access (Admin/User)
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Thai Language Support** - Noto Sans Thai font
- **Modern UI** - Clean, professional design with smooth animations

## 🏗️ Project Structure (Refactored)

```
src/
├── app/                              # Next.js App Router
│   ├── api/                          # API Routes
│   │   ├── admin/                    # Admin APIs
│   │   │   ├── upload/route.ts       # Excel upload API
│   │   │   └── import/route.ts       # Import data API
│   │   └── data/route.ts             # Fetch data API
│   ├── admin/                        # Admin Pages
│   │   └── upload/page.tsx           # Excel upload page
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Main page (clean, ~60 lines)
├── components/
│   ├── ui/                           # Reusable UI components
│   ├── layout/                       # Layout components
│   ├── dashboard/                    # Dashboard views
│   ├── projects/                     # Projects views
│   └── tasks/                        # Tasks views
├── hooks/                            # Custom React hooks
│   └── useDashboardData.ts
├── types/                            # TypeScript types
│   └── index.ts
├── lib/                              # Utilities & Data Store
│   ├── utils.ts
│   ├── constants.ts
│   └── dataStore.ts                  # JSON-based data store
└── data/                             # Mock data
    └── mockData.ts
```

## 🔐 Authentication

Protected routes with NextAuth.js v5 (Auth.js).

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@taskflow.com` | `********` |

### Features

- ✅ **Login Page** - Beautiful, responsive login UI
- ✅ **Protected Routes** - Auto-redirect to login if not authenticated
- ✅ **Role-based Access** - Admin-only pages (Import Excel)
- ✅ **Session Management** - JWT-based sessions (30 days)
- ✅ **Logout** - Secure sign-out with redirect

### Protected Pages

| Route | Access |
|-------|--------|
| `/` (Dashboard) | Authenticated users |
| `/admin/upload` | Admin only |
| `/login` | Public (redirects if logged in) |

---

## 📤 Excel Import Feature

Import projects and tasks from Excel files (.xlsx, .xls) directly into the dashboard.

### How to Use

1. Click **"Import Excel"** in the Admin section of the sidebar
2. Select import type: **Projects** or **Tasks**
3. Download template for reference
4. Upload your Excel file
5. Preview data before importing
6. Choose import mode: **Upsert**, **Create Only**, or **Update Only**
7. Confirm import

### Excel Template Format

See [EXCEL_TEMPLATE.md](./EXCEL_TEMPLATE.md) for detailed column specifications.

### Data Storage

- Data is stored in JSON files (`data/projects.json`, `data/tasks.json`)
- No database required - perfect for Vercel deployment
- Data persists between server restarts

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (recommended for Next.js 16)
- npm, pnpm, or yarn

### Installation

```bash
cd ~/Organization/ToppLab/taskflow

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local and set NEXTAUTH_SECRET (generate with: openssl rand -base64 32)

# Start development server (with Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |

## 📊 Key Improvements

### Refactoring
| Before | After |
|--------|-------|
| ❌ Single 800+ line page.tsx | ✅ Modular components (~150 lines max) |
| ❌ Mixed concerns | ✅ Separation of concerns |
| ❌ Hard to maintain | ✅ Easy to extend |
| ❌ Minimal types | ✅ Full TypeScript support |

### Next.js 16 Upgrade
- ✅ React 19 with automatic JSX runtime
- ✅ Turbopack for 700x faster cold starts
- ✅ Optimized font loading (Google Fonts)
- ✅ ESM config format
- ✅ Better caching and streaming

## 🎯 Next Steps

1. ✅ **Excel Import** - เรียบร้อยแล้ว!
2. ✅ **Authentication** - เรียบร้อยแล้ว!
3. **Connect to Database** - Upgrade to PostgreSQL with Prisma (optional)
4. **Add Tests** - Jest + React Testing Library
5. **Deploy** - Vercel, Railway, or your VPS

## 📄 License

MIT
