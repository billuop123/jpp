"use client"

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

interface AuthCheckerProps {
  children: ReactNode;
}

const PUBLIC_ROUTES = ["/", "/api/auth/signin", "/api/auth/signout"];

export default function AuthChecker({ children }: AuthCheckerProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(route);
  });

  useEffect(() => {
    if (!isPublicRoute && status === "unauthenticated" && pathname) {
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/api/auth/signin?callbackUrl=${callbackUrl}`);
    }
  }, [router, status, isPublicRoute, pathname]);
  if (isPublicRoute) {
    return <>{children}</>;
  }
  if (status === "loading") {
    return null;
  }
  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}