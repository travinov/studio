
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // If no session cookie exists, redirect to login page for any protected route.
  if (!session) {
    if (pathname.startsWith('/craft') || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // If a session cookie exists, and user is on a public page, redirect to /craft.
  // The actual verification of the cookie and role will happen on the page/layout itself.
  if (pathname === '/' || pathname === '/register') {
     return NextResponse.redirect(new URL('/craft', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  // Match all routes except for static assets and API routes.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
