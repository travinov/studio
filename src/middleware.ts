'use server';

import { type NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth } from '@/lib/firebase-admin';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value || '';

  // Если cookie сессии нет, а пользователь пытается получить доступ к защищенному маршруту,
  // перенаправляем его на страницу входа.
  if (!session && (request.nextUrl.pathname.startsWith('/craft') || request.nextUrl.pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Если cookie сессии есть, но пользователь находится на странице входа/регистрации,
  // нам нужно проверить его роль, чтобы перенаправить в правильное место.
  if (session) {
    try {
      const decodedIdToken = await adminAuth.verifySessionCookie(session, true);
      
      // Если пользователь - админ и находится на публичной или обычной странице, перенаправляем в админ-панель
      if (decodedIdToken.role === 'admin' && !request.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }

      // Если обычный пользователь и находится на публичной странице, перенаправляем в craft
      if (decodedIdToken.role !== 'admin' && (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/register')) {
         return NextResponse.redirect(new URL('/craft', request.url));
      }

      // Добавляем UID пользователя в заголовки для использования в серверных компонентах
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('X-User-UID', decodedIdToken.uid);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

    } catch (error) {
      // Сессия недействительна. Удаляем cookie и перенаправляем на страницу входа.
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  // Для всех остальных случаев (например, публичные маршруты без сессии) просто продолжаем.
  return NextResponse.next();
}

export const config = {
  // Применяем ко всем маршрутам, кроме статических ресурсов, API-маршрутов и favicon.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
