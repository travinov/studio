import { type NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth } from '@/lib/firebase-admin';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value || '';

  // If no session cookie, redirect to login page
  if (!session) {
    if (request.nextUrl.pathname.startsWith('/craft')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Verify the session cookie
  try {
    const decodedIdToken = await adminAuth.verifySessionCookie(session, true);
    
    // User is authenticated
    // If they are trying to access public pages like login/register, redirect to craft
    if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/register') {
      return NextResponse.redirect(new URL('/craft', request.url));
    }
    
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-UID', decodedIdToken.uid);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    // Session cookie is invalid. Clear it and redirect to login.
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('session');
    
    if (request.nextUrl.pathname.startsWith('/craft')) {
        return response;
    }
    
    return NextResponse.next();
  }
}

export const config = {
  // Match all routes except for static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
