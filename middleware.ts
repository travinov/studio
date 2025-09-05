import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value

  if (!authToken) {
    if (request.nextUrl.pathname.startsWith('/craft')) {
        return NextResponse.redirect(new URL('/', request.url))
    }
  } else {
     if (request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/craft', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/craft/:path*', '/'],
}
