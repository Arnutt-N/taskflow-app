import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';

export async function GET() {
  const session = await auth();
  const guard = requireRole(session, ['ADMIN']);
  if (guard) return guard;

  const departments = await prisma.department.findMany({
    include: { _count: { select: { users: true, teams: true } } },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(departments);
}

export async function POST(req: Request) {
  const session = await auth();
  const guard = requireRole(session, ['ADMIN']);
  if (guard) return guard;

  const { name, description, color } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const dept = await prisma.department.create({
    data: { name: name.trim(), description, color: color || '#6366f1' },
  });
  return NextResponse.json(dept, { status: 201 });
}
