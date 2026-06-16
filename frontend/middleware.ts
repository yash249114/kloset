import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedPaths = ['/dashboard', '/seller', '/admin', '/booking', '/outfit/new', '/profile', '/orders', '/wishlist', '/renter'];

// Routes that should redirect to dashboard if already authenticated
const authPaths = ['/auth/login', '/auth/register', '/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token in cookies or localStorage is not available in middleware
  // We use a lightweight cookie-based check here
  const hasToken = request.cookies.get('kloset-auth');

  // Protect dashboard routes — redirect to login if not authenticated
  const isProtectedRoute = protectedPaths.some((path) => pathname.startsWith(path));
  if (isProtectedRoute && !hasToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth pages to home
  const isAuthRoute = authPaths.some((path) => pathname === path || pathname.startsWith(path + '/'));
  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/seller/:path*',
    '/admin/:path*',
    '/booking/:path*',
    '/outfit/new',
    '/profile/:path*',
    '/orders/:path*',
    '/wishlist/:path*',
    '/renter/:path*',
    '/auth/login',
    '/auth/register',
    '/login',
    '/register',
  ],
};
