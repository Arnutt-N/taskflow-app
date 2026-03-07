import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/stats
// Returns aggregated statistics used by the dashboard.
// This is the single authoritative source — all UI components should use this.
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // ── Tasks by status ──────────────────────────────────────────────────────
    const [tasks, projects] = await Promise.all([
      prisma.task.findMany({
        select: { status: true, priority: true, assigneeId: true, dueDate: true },
      }),
      prisma.project.findMany({
        select: {
          id: true,
          status: true,
          progress: true,
          budget: true,
          revenue: true,
          deadline: true,
        },
      }),
    ]);

    // Task stats
    const totalTasks = tasks.length;
    const done = tasks.filter(t => t.status === 'DONE').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const review = tasks.filter(t => t.status === 'REVIEW').length;
    const todo = tasks.filter(t => t.status === 'TODO').length;
    const planning = 0; // Removed planning because it's not a valid PRISMA task status
    const overdue = tasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'DONE';
    }).length;

    // Project stats
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS');
    const totalRevenue = projects.reduce((s, p) => s + Number(p.revenue || 0), 0);
    const totalBudget = projects.reduce((s, p) => s + Number(p.budget || 0), 0);
    const totalProfit = totalRevenue - totalBudget;
    const margin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;
    const avgProgress = activeProjects.length > 0
      ? Math.round(activeProjects.reduce((s, p) => s + p.progress, 0) / activeProjects.length)
      : 0;

    return NextResponse.json({
      tasks: {
        total: totalTasks,
        done,
        inProgress,
        review,
        todo,
        planning,
        overdue,
      },
      projects: {
        total: totalProjects,
        active: activeProjects.length,
        completed: projects.filter(p => p.status === 'DONE').length,
      },
      financials: {
        totalRevenue,
        totalBudget,
        totalProfit,
        margin,
      },
      progress: {
        average: avgProgress,
      },
    });
  } catch (error) {
    console.error('[api/stats] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
