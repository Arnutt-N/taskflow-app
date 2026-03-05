import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple auth check via cookie
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('next-auth.session-token')?.value;
  const isLoggedIn = !!sessionToken;

  const isPublicRoute = ['/login', '/register'].includes(pathname);
  const isApiAuthRoute = pathname.startsWith('/api/auth');

  // Allow auth API routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Allow static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect logged-in users away from login page
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
