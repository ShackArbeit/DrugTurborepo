import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const pathname = nextUrl.pathname;

  const needAuth =
    pathname.startsWith('/case') ||
    pathname.startsWith('/evidence') ||
    pathname.startsWith('/accountAdmin/permission');

  if (!needAuth) {
    return NextResponse.next();
  }

  const hasToken = Boolean(cookies.get('token')?.value);

  if (!hasToken) {
    const url = new URL('/login', req.url);
    // ✅ 這裡用的就是 redirect
    url.searchParams.set('redirect', pathname);
    url.searchParams.set('reason', 'need-login');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/case',
    '/case/:path*',
    '/evidence',
    '/evidence/:path*',
    '/accountAdmin/permission',
    '/accountAdmin/permission/:path*',
    '/accountAdmin/:path*',
  ],
};
