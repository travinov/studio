
import { type NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth } from '@/lib/firebase-admin';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  // If no session, redirect protected routes to login
  if (!session) {
    if (request.nextUrl.pathname.startsWith('/craft') || request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Verify the session cookie. This is Edge-compatible.
  try {
    const decodedIdToken = await adminAuth.verifySessionCookie(session, true);
    
    // If the user is authenticated, prevent them from accessing public login/register pages
    if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/register') {
      // Redirect to a base authenticated route. The page itself can then handle role-based redirection.
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
    // Session cookie is invalid. Clear it and redirect to login if it's a protected route.
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('session');
    
    if (request.nextUrl.pathname.startsWith('/craft') || request.nextUrl.pathname.startsWith('/admin')) {
        return response;
    }
    
    // For public pages, just clear the invalid cookie and proceed.
    const nextResponse = NextResponse.next();
    nextResponse.cookies.delete('session');
    return nextResponse;
  }
}

export const config = {
  // Match all routes except for static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
