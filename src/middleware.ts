import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
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
  // перенаправляем его на главную страницу приложения.
  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL('/craft', request.url));
  }
  
  // В противном случае, продолжаем как обычно.
  return NextResponse.next();
}

export const config = {
  // Применяется ко всем маршрутам, кроме статических ресурсов, API-маршрутов и favicon.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
