import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [tasks, projects, recentActivity] = await Promise.all([
    prisma.task.findMany({
      select: { status: true, priority: true, dueDate: true, createdAt: true, actualHours: true, estimatedHours: true },
    }),
    prisma.project.findMany({
      select: { id: true, name: true, status: true, progress: true, budget: true, revenue: true, deadline: true, createdAt: true },
    }),
    prisma.activityLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, avatar: true } } },
    }),
  ]);

  // Task completion rate
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => ['Done', 'Completed'].includes(t.status)).length;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !['Done', 'Completed'].includes(t.status)).length;

  // Priority breakdown
  const byPriority = {
    Critical: tasks.filter(t => t.priority === 'Critical').length,
    High: tasks.filter(t => t.priority === 'High').length,
    Medium: tasks.filter(t => t.priority === 'Medium').length,
    Low: tasks.filter(t => t.priority === 'Low').length,
  };

  // Status distribution
  const byStatus = {
    Todo: tasks.filter(t => t.status === 'Todo').length,
    Planning: tasks.filter(t => t.status === 'Planning').length,
    'In Progress': tasks.filter(t => t.status === 'In Progress').length,
    Review: tasks.filter(t => t.status === 'Review').length,
    Done: doneTasks,
  };

  // Financial summary
  const totalBudget = projects.reduce((s, p) => s + Number(p.budget || 0), 0);
  const totalRevenue = projects.reduce((s, p) => s + Number(p.revenue || 0), 0);
  const profitableProjects = projects.filter(p => Number(p.revenue || 0) > Number(p.budget || 0)).length;

  // Project health
  const healthyProjects = projects.filter(p => p.progress >= 70 && p.status !== 'Completed').length;
  const atRiskProjects = projects.filter(p => {
    if (!p.deadline) return false;
    const daysLeft = Math.ceil((new Date(p.deadline).getTime() - Date.now()) / (1000 * 86400));
    return daysLeft <= 7 && p.progress < 80 && p.status !== 'Completed';
  }).length;

  // Tasks created per week (last 8 weeks)
  const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (7 - i) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return {
      week: `W-${7 - i}`,
      created: tasks.filter(t => new Date(t.createdAt) >= weekStart && new Date(t.createdAt) < weekEnd).length,
      done: tasks.filter(t => ['Done', 'Completed'].includes(t.status) && new Date(t.createdAt) >= weekStart && new Date(t.createdAt) < weekEnd).length,
    };
  });

  return NextResponse.json({
    taskMetrics: { totalTasks, doneTasks, overdueTasks, completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0 },
    byPriority,
    byStatus,
    financials: { totalBudget, totalRevenue, profit: totalRevenue - totalBudget, profitableProjects },
    projectHealth: { total: projects.length, healthy: healthyProjects, atRisk: atRiskProjects },
    weeklyTrend,
    recentActivity,
  });
}
