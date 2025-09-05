'use server';

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from 'firebase-admin';
import { cookies } from 'next/headers';

// Это middleware работает в среде "Edge" и не может использовать Node.js модули.
// Его единственная задача — проверять НАЛИЧИЕ cookie сессии и выполнять перенаправления.
// Фактическая проверка сессии должна выполняться на защищенных страницах/маршрутах.

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith('/craft') || pathname.startsWith('/admin');
  const isPublicRoute = pathname === '/' || pathname.startsWith('/register');

  // Если cookie сессии нет, а пользователь пытается получить доступ к защищенному маршруту,
  // перенаправляем его на страницу входа.
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Если cookie сессии ЕСТЬ, а пользователь находится на общедоступном маршруте (вход/регистрация),
  // мы можем предположить, что он вошел в систему, и перенаправить его на главную страницу приложения.
  // Фактическая проверка роли (admin vs user) должна происходить на самих страницах.
  if (session && isPublicRoute) {
    // Пользователи-администраторы должны быть перенаправлены на свою панель управления
    // Это потребует декодирования cookie, что невозможно в middleware.
    // Мы можем сделать базовое перенаправление на /craft, а затем /craft может перенаправить на /admin/dashboard
    // если пользователь - админ. Или мы можем оставить эту логику на клиенте.
    // Для простоты пока оставим перенаправление на /craft.
    return NextResponse.redirect(new URL('/craft', request.url));
  }
  
  // В противном случае, продолжаем как обычно.
  return NextResponse.next();
}

export const config = {
  // Применяется ко всем маршрутам, кроме статических ресурсов, API-маршрутов и favicon.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
