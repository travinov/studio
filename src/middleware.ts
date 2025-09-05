import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value || '';

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/craft') || request.nextUrl.pathname.startsWith('/admin');
  const isPublicPage = request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/register';

  // Если нет сессии и пользователь пытается зайти на защищенный маршрут, перенаправляем на главную
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Если сессия есть и пользователь на публичной странице, перенаправляем его
  if (session && isPublicPage) {
    // Мы не можем здесь проверить роль, так как это требует firebase-admin.
    // Перенаправим на /craft, а уже там серверный компонент или другой middleware
    // может выполнить перенаправление в /admin/dashboard при необходимости.
    return NextResponse.redirect(new URL('/craft', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except for static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
