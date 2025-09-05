
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  // If no session cookie, redirect to login page if trying to access a protected route
  if (!session) {
    if (request.nextUrl.pathname.startsWith('/craft') || request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // If there IS a session cookie, and user tries to access public-only pages, redirect to craft
  if (session) {
    if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/register') {
      return NextResponse.redirect(new URL('/craft', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except for static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
