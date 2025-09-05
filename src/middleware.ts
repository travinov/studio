import { type NextRequest, NextResponse } from 'next/server';

// This middleware is designed to run on the Edge and is NOT for verifying
// the session cookie's validity. It only checks for its presence.
// Actual session verification must be done on the server-side within protected pages.
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith('/craft') || pathname.startsWith('/admin');
  const isPublicAuthRoute = pathname === '/' || pathname.startsWith('/register');

  // If there's no session cookie and the user is trying to access a protected route,
  // redirect them to the login page.
  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If there IS a session cookie and the user is on a public auth route (like login),
  // redirect them to the main application page.
  if (sessionCookie && isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/craft', request.url));
  }

  // Otherwise, allow the request to proceed.
  return NextResponse.next();
}

export const config = {
  // Match all routes except for static assets and API routes.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
