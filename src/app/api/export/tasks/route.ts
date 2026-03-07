import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { utils, write } from 'xlsx';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: 'desc' },
    include: { project: { select: { name: true } } },
  });

  const rows = tasks.map(t => ({
    'Task ID': t.id,
    'Title': t.title,
    'Project': (t as { project?: { name?: string } }).project?.name ?? '',
    'Status': t.status,
    'Priority': t.priority,
    'Assignee': t.assignee ?? '',
    'Due Date': t.dueDate ? new Date(t.dueDate).toLocaleDateString('th-TH') : '',
    'Created At': new Date(t.createdAt).toLocaleDateString('th-TH'),
  }));

  const ws = utils.json_to_sheet(rows);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Tasks');

  // Auto-width columns
  const colWidths = Object.keys(rows[0] || {}).map(key => ({
    wch: Math.max(key.length, ...rows.map(r => String(r[key as keyof typeof r] || '').length)) + 2,
  }));
  ws['!cols'] = colWidths;

  const buffer = write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="tasks_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
