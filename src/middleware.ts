import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Coming Soon mode: бүх хэрэглэгчид Coming Soon хуудас харна
// Зөвхөн admin role-тэй хүмүүс бүтэн сайтыг харна
const COMING_SOON_ENABLED = false;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow these paths
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname === '/coming-soon' ||
    pathname.startsWith('/auth/')
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Coming Soon check
  if (COMING_SOON_ENABLED) {
    const isAdmin = token?.role === 'admin';

    // Admin can access everything - bypass coming soon
    if (!isAdmin) {
      // Non-admin or not logged in → show coming soon
      if (pathname !== '/coming-soon') {
        return NextResponse.rewrite(new URL('/coming-soon', request.url));
      }
      return NextResponse.next();
    }
  }

  // Protect /admin routes (for when coming soon is disabled)
  if (pathname.startsWith('/admin')) {
    // Not logged in - redirect to login
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Not admin - redirect to home
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
