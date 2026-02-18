import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    
    if (pathname.startsWith("/admindashboard")) {
      const userRole = token?.role || token?.user?.role;
      if (userRole !== "ADMIN") {
        const url = new URL("/", req.url);
        return NextResponse.redirect(url);
      }
    }
    if(pathname.startsWith('/candidatedashboard')){
      const userRole=token?.role || token?.user?.role;
      if(userRole!=='CANDIDATE'){
        const url=new URL('/',req.url);
        return NextResponse.redirect(url);
      }
    }
    if(pathname.startsWith('/recruiterdashboard')){
      const userRole=token?.role || token?.user?.role;
      if(userRole!=='RECRUITER'){
        const url=new URL('/',req.url);
        return NextResponse.redirect(url);
      }
    }
    if(pathname.startsWith('/companyjobs')){
      const userRole=token?.role || token?.user?.role;
      if(userRole!=='RECRUITER'){
        const url=new URL('/',req.url);
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
        if(pathname.startsWith('/candidatedashboard')){
          return !!token;
        }
        if(pathname.startsWith('/recruiterdashboard')){
          return !!token;
        }
        if(pathname.startsWith('/companyjobs')){
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
    "/admindashboard/:path*",
    "/candidatedashboard",
    "/candidatedashboard/:path*",
    "/recruiterdashboard",
    "/recruiterdashboard/:path*",
    "/companyjobs",
    "/companyjobs/:path*",
  ],
};

