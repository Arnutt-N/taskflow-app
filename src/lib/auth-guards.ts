import { Session } from 'next-auth';
import { NextResponse } from 'next/server';

type Role = 'ADMIN' | 'PM' | 'LEAD' | 'STAFF' | 'USER';

/**
 * Guard utility for API routes.
 * Returns a 401/403 NextResponse if the session is invalid or the user
 * does not have one of the required roles.
 * Returns null if the user IS authorized (caller can proceed normally).
 */
export function requireRole(
  session: Session | null,
  roles: Role[] = [],
): NextResponse | null {
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role as Role | undefined;

  if (roles.length > 0 && (!userRole || !roles.includes(userRole))) {
    return NextResponse.json(
      { error: 'Forbidden — insufficient permissions', required: roles, current: userRole },
      { status: 403 },
    );
  }

  return null; // authorized
}

/**
 * Returns true if the user has at least one of the given roles.
 */
export function hasRole(session: Session | null, roles: Role[]): boolean {
  if (!session?.user) return false;
  const userRole = (session.user as { role?: string }).role as Role | undefined;
  return !!userRole && roles.includes(userRole);
}
