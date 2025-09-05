
import { type NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth } from '@/lib/firebase-admin';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value || '';

  // If no session cookie, redirect to login page for protected routes
  if (!session) {
    if (request.nextUrl.pathname.startsWith('/craft') || request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // If there is a session cookie, try to verify it.
  try {
    await adminAuth.verifySessionCookie(session, true);
    
    // If authenticated, redirect away from public pages
    if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/register') {
      // In a real app, you might want to check the user's role 
      // and redirect to /admin or /craft accordingly.
      // For now, we'll just redirect to the main craft page.
      return NextResponse.redirect(new URL('/craft', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    // If the cookie is invalid, delete it.
    const response = NextResponse.next();
    response.cookies.delete('session');
    
    // If they were trying to access a protected route, redirect to login
    if (request.nextUrl.pathname.startsWith('/craft') || request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url), {
        headers: response.headers, // Carry over the delete cookie instruction
      });
    }

    return response;
  }
}

export const config = {
  // Match all routes except for static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
