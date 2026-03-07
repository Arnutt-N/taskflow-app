import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';

export async function GET() {
  const session = await auth();
  const guard = requireRole(session, ['ADMIN']);
  if (guard) return guard;

  const logs = await prisma.activityLog.findMany({
    take: 500,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(logs);
}
