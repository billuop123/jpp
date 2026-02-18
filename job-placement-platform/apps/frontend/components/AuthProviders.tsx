
"use client";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import SessionHydrator from "@/components/SessionHydrator";

export default function AuthProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SessionHydrator>{children}</SessionHydrator>
    </SessionProvider>
  );
}