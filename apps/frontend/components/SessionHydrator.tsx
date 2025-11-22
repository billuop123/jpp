"use client";

import { useSession } from "next-auth/react";
import { useEffect, type ReactNode } from "react";

import { useUser } from "@/store/user";

interface SessionHydratorProps {
  children: ReactNode;
}

export default function SessionHydrator({ children }: SessionHydratorProps) {
  const { data } = useSession();
  const setAll = useUser((state) => state.setAll);
  const reset = useUser((state) => state.reset);
  
  useEffect(() => {
    if (!data) {
      reset();
      return;
    }

    setAll({
      username: data.user?.name ?? null,
      email: data.user?.email ?? null,
      role: data.user?.role ?? null,
      image: data.user?.image ?? null,
      token: data.token ?? null,
    });
  }, [data, reset, setAll]);

  return <>{children}</>;
}

