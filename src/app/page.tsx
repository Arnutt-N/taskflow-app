import { auth } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default async function HomePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  return <DashboardLayout >;
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        Welcome back, {session.user.name}!
      </h1>
      <p className="text-slate-600">
        Engineering Taskflow v2 is under construction. 🚧
      </p>
      <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 className="font-semibold text-slate-700 mb-2">What's New</h2>
        <ul className="list-disc list-inside text-slate-600 space-y-1">
          <li>NextAuth v5 with Prisma</li>
          <li>Protected routes with middleware</li>
          <li>User management (Admin only)</li>
          <li>Notification system</li>
          <li>New UI coming soon...</li>
        </ul>
      </div>
    </div>
  </DashboardLayout>;
}
