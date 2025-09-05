import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const isLoggedIn = !!sessionCookie;

  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith('/craft') || pathname.startsWith('/admin');
  const isPublicAuthPage = pathname === '/' || pathname === '/register';

  if (isProtectedRoute && !isLoggedIn) {
    // Если пользователь не авторизован и пытается зайти на защищенный роут, перенаправляем на главную
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isPublicAuthPage && isLoggedIn) {
    // Если пользователь авторизован и пытается зайти на страницу входа/регистрации, перенаправляем в приложение
    return NextResponse.redirect(new URL('/craft', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except for static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
