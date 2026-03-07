import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';

export async function GET() {
  const session = await auth();
  const guard = requireRole(session, ['ADMIN']);
  if (guard) return guard;

  const teams = await prisma.team.findMany({
    include: {
      department: { select: { id: true, name: true, color: true } },
      _count: { select: { members: true } },
    },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(teams);
}

export async function POST(req: Request) {
  const session = await auth();
  const guard = requireRole(session, ['ADMIN']);
  if (guard) return guard;

  const { name, description, departmentId } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const team = await prisma.team.create({
    data: { name: name.trim(), description, departmentId: departmentId || null },
    include: { department: { select: { id: true, name: true, color: true } } },
  });
  return NextResponse.json(team, { status: 201 });
}
