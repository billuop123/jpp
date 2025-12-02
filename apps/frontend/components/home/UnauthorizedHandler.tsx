"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function UnauthorizedHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const unauthorized = searchParams?.get("unauthorized");
    if (unauthorized === "admin") {
      toast.error("Access denied. Admin privileges required to access the admin dashboard.");
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("unauthorized");
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  }, [searchParams, router]);

  return null;
}



