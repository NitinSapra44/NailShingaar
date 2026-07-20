import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 7:00 PM IST on July 22, 2026 = 13:30 UTC
const LAUNCH_TIME = new Date('2026-07-22T13:30:00.000Z').getTime();

const BYPASS_COOKIE = 'ns_preview';
const BYPASS_VALUE  = 'reet2026';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow: coming-soon page, admin, auth, API, static files
  if (
    pathname.startsWith('/coming-soon') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|gif|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Allow if bypass cookie is set
  if (request.cookies.get(BYPASS_COOKIE)?.value === BYPASS_VALUE) {
    return NextResponse.next();
  }

  if (Date.now() < LAUNCH_TIME) {
    return NextResponse.redirect(new URL('/coming-soon', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
