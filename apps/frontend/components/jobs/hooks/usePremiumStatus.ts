import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BACKEND_URL } from "@/scripts/lib/config";

export function usePremiumStatus(token: string | null) {
  const [isPremium, setIsPremium] = useState(false);

  const isPremiumQuery = useQuery({
    queryKey: ["is-premium"],
    enabled: !!token,
    retry: false,
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/users/is-premium`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token!,
        },
      });
      if (!response.ok) throw new Error("Failed to check if you are premium");
      const res = await response.json();
      return res;
    },
  });

  useEffect(() => {
    if (isPremiumQuery.isError) {
      toast.error(isPremiumQuery.error.message || "Failed to check if you are premium");
    }
  }, [isPremiumQuery.isError]);

  useEffect(() => {
    if (isPremiumQuery.data) {
      setIsPremium(isPremiumQuery.data.isPremium);
    }
  }, [isPremiumQuery.data]);

  return { isPremiumQuery, isPremium };
}

