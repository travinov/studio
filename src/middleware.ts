
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith('/craft') || pathname.startsWith('/admin');
  const isPublicAuthRoute = pathname === '/' || pathname === '/register';

  // If there's no session cookie
  if (!session) {
    // If the user tries to access a protected route, redirect to login
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Otherwise, allow access to public routes
    return NextResponse.next();
  }

  // If there IS a session cookie
  // If the user tries to access the login or register page, redirect to the craft page
  if (isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/craft', request.url));
  }
  
  // For all other cases (e.g., accessing a protected route with a cookie),
  // allow the request to proceed. The actual verification of the cookie's validity
  // will be handled on the page/layout level, which runs in a Node.js environment.
  return NextResponse.next();
}

export const config = {
  // Match all routes except for static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
