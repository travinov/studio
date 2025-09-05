import { type NextRequest, NextResponse } from 'next/server';

// Этот middleware выполняется в среде Edge и НЕ предназначен для проверки
// валидности cookie сессии. Он только проверяет её наличие.
// Фактическая проверка сессии должна выполняться на стороне сервера на защищенных страницах.
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith('/craft') || pathname.startsWith('/admin');
  const isPublicAuthRoute = pathname === '/' || pathname.startsWith('/register');

  // Если cookie сессии нет, а пользователь пытается получить доступ к защищенному маршруту,
  // перенаправляем его на страницу входа.
  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Если cookie сессии ЕСТЬ, а пользователь находится на публичном маршруте аутентификации (например, логин),
  // перенаправляем его на главную страницу приложения.
  if (sessionCookie && isPublicAuthRoute) {
    // Мы не знаем роль пользователя здесь, поэтому по умолчанию отправляем в /craft.
    // Если это администратор, он будет перенаправлен дальше со страницы /craft.
    return NextResponse.redirect(new URL('/craft', request.url));
  }

  // В остальных случаях разрешаем запрос.
  return NextResponse.next();
}

export const config = {
  // Применяется ко всем маршрутам, кроме статических файлов и API-маршрутов.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
