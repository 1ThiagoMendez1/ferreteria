import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to auth pages
        if (pathname.startsWith('/auth')) {
          return true;
        }

        // Allow access to API routes (they handle auth internally)
        if (pathname.startsWith('/api')) {
          return true;
        }

        // Require authentication for dashboard
        if (pathname.startsWith('/dashboard')) {
          return !!token;
        }

        // Allow access to public pages
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/auth/:path*'
  ]
};