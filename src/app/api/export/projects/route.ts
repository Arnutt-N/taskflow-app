import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { utils, write } from 'xlsx';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const rows = projects.map(p => ({
    'Project ID': p.id,
    'Name': p.name,
    'Status': p.status,
    'Progress (%)': p.progress,
    'Budget (฿)': p.budget ? Number(p.budget) : 0,
    'Revenue (฿)': p.revenue ? Number(p.revenue) : 0,
    'Profit (฿)': (p.revenue ? Number(p.revenue) : 0) - (p.budget ? Number(p.budget) : 0),
    'Team': p.team ?? '',
    'Deadline': p.deadline ? new Date(p.deadline).toLocaleDateString('th-TH') : '',
    'Created At': new Date(p.createdAt).toLocaleDateString('th-TH'),
  }));

  const ws = utils.json_to_sheet(rows);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Projects');

  const colWidths = Object.keys(rows[0] || {}).map(key => ({
    wch: Math.max(key.length, ...rows.map(r => String(r[key as keyof typeof r] || '').length)) + 2,
  }));
  ws['!cols'] = colWidths;

  const buffer = write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="projects_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
