// middleware.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdmin = (req.auth?.user as any)?.role === 'admin';

  const res = NextResponse.next();

  // Public routes
  const publicRoutes = ['/login', '/api/auth'];
  const isPublicRoute = publicRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Admin only routes
  const adminRoutes = ['/admin'];
  const isAdminRoute = adminRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Redirect to login if not authenticated
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Redirect to home if admin route but not admin
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // Redirect to home if already logged in and trying to access login
  if (isLoggedIn && nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  return res;
});

export const config = {
  // Avoid matching NextAuth route handlers; middleware wrapping can interfere with auth endpoints.
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
