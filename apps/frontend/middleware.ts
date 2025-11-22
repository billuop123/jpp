import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    
    if (pathname.startsWith("/admindashboard")) {
      const userRole = token?.role || token?.user?.role;
      if (userRole !== "ADMIN") {
        const url = new URL("/", req.url);
        return NextResponse.redirect(url);
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname.startsWith("/admindashboard")) {
          return !!token; 
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admindashboard",
    "/admindashboard/:path*"
  ],
};

