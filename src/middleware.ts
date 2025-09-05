import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value || '';

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/craft') || request.nextUrl.pathname.startsWith('/admin');
  const isPublicAuthPage = request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/register';

  // Если нет сессии и пользователь пытается зайти на защищенный роут, перенаправляем на главную
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Если сессия есть и пользователь на странице входа/регистрации, перенаправляем в приложение
  if (session && isPublicAuthPage) {
    return NextResponse.redirect(new URL('/craft', request.url));
  }
  
  // Во всех остальных случаях просто продолжаем
  return NextResponse.next();
}

export const config = {
  // Match all routes except for static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
