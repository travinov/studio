
import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith('/craft') || pathname.startsWith('/admin');
  const isPublicAuthRoute = pathname === '/' || pathname.startsWith('/register');

  // 1. Если cookie сессии нет, а пользователь пытается зайти на защищенный маршрут
  if (!sessionCookie && isProtectedRoute) {
    // Перенаправляем его на страницу входа
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Если cookie сессии есть, а пользователь находится на странице входа/регистрации
  if (sessionCookie && isPublicAuthRoute) {
    // Перенаправляем его в приложение.
    // Дальнейшая логика (например, перенаправление админа в /admin/dashboard)
    // должна обрабатываться на уровне страниц.
    return NextResponse.redirect(new URL('/craft', request.url));
  }

  // Во всех остальных случаях разрешаем запрос
  return NextResponse.next();
}

export const config = {
  // Применяется ко всем маршрутам, кроме статических активов и API
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
