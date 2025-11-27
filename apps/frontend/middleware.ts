import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const pathname = nextUrl.pathname;

  // 只保護後台管理相關頁面
  const needAuth =
    pathname.startsWith('/accountAdmin/permission') ||
    pathname.startsWith('/accountAdmin');

  // 不需要登入的路徑，直接放行
  if (!needAuth) {
    return NextResponse.next();
  }

  const hasToken = Boolean(cookies.get('token')?.value);

  if (!hasToken) {
    const url = new URL('/login', req.url);
    url.searchParams.set('redirect', pathname);
    url.searchParams.set('reason', 'need-login');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/accountAdmin/permission',
    '/accountAdmin/permission/:path*',
    '/accountAdmin/:path*',
  ],
};
