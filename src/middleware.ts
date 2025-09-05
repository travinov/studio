
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value || '';

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/craft') || request.nextUrl.pathname.startsWith('/admin');
  const isPublicAuthPage = request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/register';

  // If no session cookie, redirect to login page if trying to access protected routes
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If there IS a session cookie and user is on a public auth page, redirect to craft
  if (session && isPublicAuthPage) {
    return NextResponse.redirect(new URL('/craft', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except for static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
