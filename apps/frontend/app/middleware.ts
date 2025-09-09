import { NextResponse, NextRequest } from 'next/server'

export function middleware ( req:NextRequest){
      const token = req.cookies.get('token')?.value
      const { pathname } = req.nextUrl
      const isPublic = pathname.startsWith('/login') || pathname.startsWith('/register')
      if(!token && !isPublic){
            const url = req.nextUrl.clone()
            url.pathname= 'login'
            url.searchParams.set('returnTo', pathname);
            return NextResponse.redirect(url)
      }
      return NextResponse.next()
}

export const config = {
  matcher: ['/case/:path*', '/evidence/:path*'], 
};