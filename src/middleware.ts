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

  // Verify the session cookie
  try {
    const decodedIdToken = await adminAuth.verifySessionCookie(session, true);
    
    // User is authenticated
    // If they are trying to access public pages like login/register, redirect them
    if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/register') {
      // The middleware can't reliably check Firestore for the 'admin' role.
      // We will redirect admins on the client-side or on the page server component itself.
      // For now, we redirect all authenticated users away from public pages.
      // A simple redirect to /craft is a safe default. Admins might be briefly redirected here
      // before being sent to /admin/dashboard by the logic on the /craft page or another middleware.
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
    // Session cookie is invalid. Clear it and redirect to login if on a protected route.
    const response = NextResponse.redirect(new URL('/', request.url));
    if (request.nextUrl.pathname.startsWith('/craft') || request.nextUrl.pathname.startsWith('/admin')) {
        response.cookies.delete('session');
        return response;
    }
    
    // For public pages, just clear the invalid cookie and continue
    const nextResponse = NextResponse.next();
    nextResponse.cookies.delete('session');
    return nextResponse;
  }
}

export const config = {
  // Match all routes except for static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
