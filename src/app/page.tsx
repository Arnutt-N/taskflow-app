import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { prisma } from '@/lib/prisma';
import { Project, Task } from '@/types';

export default async function HomePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  let rawProjects: any[] = [];
  let rawTasks: any[] = [];
  
  try {
    // Fetch all projects and tasks for the executive overview
    // In a real huge app, we'd paginate or filter by active only, 
    // but for the dashboard overview we pull what we need to compute stats.
    rawProjects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    
    rawTasks = await prisma.task.findMany({
      orderBy: { updatedAt: 'desc' }
    });
  } catch (error) {
    console.error("Failed to fetch dashboard data from Prisma:", error);
    // Fallback to empty state if DB is unreachable
  }

  // Convert Prisma Types to our Frontend Types
  // Ensure we safely map dates and potential nulls
  const projects: Project[] = rawProjects.map(p => ({
    id: p.id,
    name: p.name,
    team: p.team || 'Unassigned',
    status: p.status as Project['status'],
    deadline: p.deadline.toISOString(),
    progress: p.progress,
    budget: p.budget ? Number(p.budget) : 0,
    revenue: p.revenue ? Number(p.revenue) : 0,
    members: p.members || [],
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  const tasks: Task[] = rawTasks.map(t => ({
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    assignee: t.assignee || 'Unassigned',
    status: t.status as Task['status'],
    priority: t.priority as Task['priority'],
    dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <DashboardLayout>
      <div className="pt-4">
        <DashboardClient 
          projects={projects} 
          tasks={tasks} 
          userName={session.user?.name || 'User'} 
        />
      </div>
    </DashboardLayout>
  );
}
