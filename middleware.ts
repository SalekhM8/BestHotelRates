import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect specific routes
        const protectedPaths = ['/profile', '/bookings', '/wishlist'];
        const pathname = req.nextUrl.pathname;
        
        if (protectedPaths.some(path => pathname.startsWith(path))) {
          return !!token;
        }
        
        return true;
      },
    },
    pages: {
      signIn: '/',
    },
  }
);

export const config = {
  matcher: ['/profile/:path*', '/bookings/:path*', '/wishlist/:path*'],
};

