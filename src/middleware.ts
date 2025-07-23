// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const publicPaths = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/api/auth/:path*',
];

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth.token;

    

    if (token && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      async authorized({ token, req }) {
        const pathname = req.nextUrl.pathname;

     
        if (publicPaths.some(path => pathname === path || (path.endsWith('/:path*') && pathname.startsWith(path.replace('/:path*', ''))))) {
          console.log('Middleware: Public path via NextAuth authorized callback, allowing access:', pathname);
          return true;
        }

        console.log('Middleware: Protected path via NextAuth authorized callback, checking token for:', pathname, 'Token exists:', !!token);
        return !!token;
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/uploadthing).*)', // <-- ADD 'api/uploadthing' here
  ],
};