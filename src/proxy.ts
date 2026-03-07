import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const token = req.cookies.get('next-auth.session-token')?.value ||
    req.cookies.get('__Secure-next-auth.session-token')?.value;
  
  const isLoggedIn = !!token;

  if (nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  const adminRoutes = ['/admin'];
  const isAdminRoute = adminRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  if (isLoggedIn && nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  return NextResponse.next();
}
