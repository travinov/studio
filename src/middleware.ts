
import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith('/craft') || pathname.startsWith('/admin');
  const isPublicAuthRoute = pathname === '/' || pathname === '/register';

  // If there's no session cookie and the user is trying to access a protected route,
  // redirect them to the login page.
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If there is a session cookie and the user is on the login or register page,
  // redirect them to the main application page.
  if (session && isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/craft', request.url));
  }

  // Otherwise, allow the request to proceed.
  return NextResponse.next();
}

export const config = {
  // Match all routes except for static assets, API routes, and the favicon.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
