# Migration Guide: Next.js 14 → Next.js 16+

## ✅ สิ่งที่อัปเดตแล้ว

### Dependencies
| Package | Before | After |
|---------|--------|-------|
| next | 14.2.0 | 16.0.0 |
| react | 18.2.0 | 19.0.0 |
| react-dom | 18.2.0 | 19.0.0 |
| typescript | 5.4.0 | 5.6.0 |
| lucide-react | 0.400.0 | 0.468.0 |
| eslint | 8.57.0 | 9.0.0 |

### New Packages
- `clsx` - Utility for conditional classes
- `tailwind-merge` - Merge Tailwind classes without conflicts

### Config Changes
- `next.config.js` → `next.config.mjs` (ESM format)
- Added Turbopack for faster dev builds
- Added type-check script

---

## 🚀 วิธีติดตั้งและรัน

### 1. ลบ node_modules เดิม
```bash
cd ~/Organization/ToppLab/taskflow
rm -rf node_modules package-lock.json
```

### 2. ติดตั้ง Dependencies ใหม่
```bash
npm install
```

### 3. รัน Development Server (ด้วย Turbopack)
```bash
npm run dev
```

### 4. ตรวจสอบ TypeScript
```bash
npm run type-check
```

### 5. Build สำหรับ Production
```bash
npm run build
npm start
```

---

## 📝 การเปลี่ยนแปลงหลักใน Next.js 16

### 1. React 19 Features
- Automatic JSX runtime (ไม่ต้อง import React)
- Use hook สำหรับ data fetching
- Form actions สำหรับ server actions
- Asset loading API

### 2. App Router Stable
- App Router เป็น default แล้ว
- Caching behavior เปลี่ยนไป
- Better streaming support

### 3. Turbopack
- เร็วกว่า Webpack 700x สำหรับ cold start
- ใช้ `next dev --turbopack` (default ใน package.json ใหม่)

### 4. TypeScript Strict Mode
- Target ES2022
- Better type inference

---

## ⚠️ Breaking Changes ที่ต้องรู้

### 1. Caching Behavior
Next.js 16 เปลี่ยน caching strategy:
```typescript
// ก่อนหน้านี้: cache โดย default
// ตอนนี้: ต้องระบุ cache เองถ้าต้องการ

// ตัวอย่าง: Fetch data with cache
async function getData() {
  const res = await fetch('...', {
    next: { revalidate: 3600 } // Cache 1 hour
  })
  return res.json()
}
```

### 2. Image Optimization
ถ้าใช้ `next/image` ต้องระบุ remotePatterns:
```javascript
// next.config.mjs
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'example.com',
    },
  ],
}
```

### 3. ESLint 9
ESLint 9 ใช้ config format ใหม่:
```javascript
// eslint.config.mjs (ถ้าต้องการ customize)
import nextPlugin from '@next/eslint-plugin-next'

export default [
  {
    ...nextPlugin.configs.recommended,
  },
]
```

---

## 🎯 Best Practices สำหรับ Next.js 16

### 1. ใช้ Server Components เป็น Default
```typescript
// ✅ Good: Server Component (default)
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// ⚠️ ใช้ 'use client' เมื่อจำเป็นเท่านั้น
'use client'
export default function ClientComponent() {
  // useState, useEffect, etc.
}
```

### 2. ใช้ React 19 Hooks
```typescript
// ใช้ use() สำหรับ promises
import { use } from 'react'

function Page({ dataPromise }) {
  const data = use(dataPromise)
  return <div>{data.title}</div>
}
```

### 3. Optimize Fonts
```typescript
import { Inter, Noto_Sans_Thai } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const notoSansThai = Noto_Sans_Thai({ subsets: ['thai'], variable: '--font-noto-thai' })

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${notoSansThai.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

---

## 🧪 Testing Checklist

- [ ] `npm run dev` - Development server รันได้
- [ ] `npm run build` - Build สำเร็จ
- [ ] `npm start` - Production server รันได้
- [ ] Dashboard แสดงข้อมูลถูกต้อง
- [ ] Projects tab ทำงานปกติ
- [ ] Tasks tab ทำงานปกติ
- [ ] Search และ filter ทำงานได้
- [ ] Responsive design ยังใช้ได้
- [ ] Fonts โหลดถูกต้อง (Thai + English)

---

## 🐛 Troubleshooting

### Error: Module not found
```bash
rm -rf node_modules .next
npm install
```

### Error: TypeScript errors
```bash
npm run type-check
# แก้ไข errors ที่แสดง
```

### Error: Build failed
```bash
# เช็ค ESLint
npm run lint

# เช็ค TypeScript
npm run type-check
```

---

## 📚 Resources

- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [React 19 Documentation](https://react.dev/blog/2024/04/25/react-19)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Turbopack Documentation](https://nextjs.org/docs/architecture/turbopack)

---

**Migration Date:** 2026-02-28  
**Status:** ✅ Complete
