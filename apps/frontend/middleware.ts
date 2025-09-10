
import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const pathname = nextUrl.pathname;

  const needAuth =
    pathname.startsWith('/case') ||
    pathname.startsWith('/evidence');

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
    '/case',           
    '/case/:path*',    
    '/evidence',
    '/evidence/:path*',
  ],
};
