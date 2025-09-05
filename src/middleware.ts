import { type NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth } from '@/lib/firebase-admin';
import { getUserData } from '@/app/actions';

async function handleUnauthenticated(request: NextRequest) {
    const isProtectedCraftRoute = request.nextUrl.pathname.startsWith('/craft');
    const isProtectedAdminRoute = request.nextUrl.pathname.startsWith('/admin');

    if (isProtectedCraftRoute || isProtectedAdminRoute) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
}

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value || '';

  if (!session) {
    return handleUnauthenticated(request);
  }

  try {
    const decodedIdToken = await adminAuth.verifySessionCookie(session, true);
    const user = await getUserData(decodedIdToken.uid);

    if (!user) {
        // This case should be rare, but handles if a user is deleted from DB but has a valid session.
        const response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.delete('session');
        return response;
    }
    
    // User is authenticated, now check roles and status
    const isPublicRoute = request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/register';
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isCraftRoute = request.nextUrl.pathname.startsWith('/craft');
    
    // Redirect admins to their dashboard if they try to access craft or public pages
    if (user.role === 'admin') {
      if (isCraftRoute || isPublicRoute) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if(isAdminRoute) {
        return NextResponse.next();
      }
    }
    
    // Handle regular users
    if (user.role === 'user') {
       if (isAdminRoute) {
         // Prevent non-admins from accessing admin routes
         return NextResponse.redirect(new URL('/craft', request.url));
       }
       if (isPublicRoute) {
         // Redirect logged-in users away from public pages
         return NextResponse.redirect(new URL('/craft', request.url));
       }
       if (user.approvalStatus !== 'approved') {
         // If user is on a protected route but not approved, log them out and redirect
         if (isCraftRoute) {
            const response = NextResponse.redirect(new URL('/', request.url));
            response.cookies.delete('session');
            // We could add a query param to show a message, e.g., ?message=pending_approval
            return response;
         }
       }
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-UID', decodedIdToken.uid);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    // Session cookie is invalid. Clear it and redirect.
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('session');
    
    if (request.nextUrl.pathname.startsWith('/craft') || request.nextUrl.pathname.startsWith('/admin')) {
        return response;
    }
    
    return NextResponse.next();
  }
}

export const config = {
  // Match all routes except for static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
