import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Coming Soon: Production domain дээр Coming Soon page харуулна
// Local (localhost) дээр бүтэн website ажиллана
const COMING_SOON_DOMAINS = ['kmarket.mn', 'www.kmarket.mn'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Coming Soon check - only on production domain
  const isProductionDomain = COMING_SOON_DOMAINS.some(domain => hostname.includes(domain));
  const isComingSoon = process.env.NEXT_PUBLIC_COMING_SOON === 'true' && isProductionDomain;

  if (isComingSoon) {
    // Allow API routes and static assets to work
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon') ||
      pathname === '/coming-soon'
    ) {
      return NextResponse.next();
    }

    // Redirect everything else to coming-soon page
    return NextResponse.rewrite(new URL('/coming-soon', request.url));
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

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
