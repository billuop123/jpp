"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

interface PremiumSectionProps {
  isAuthenticated: boolean;
  loading: boolean;
  statusMessage: string | null;
  onBuyPremium: () => Promise<void> | void;
}

export default function PremiumSection({
  isAuthenticated,
  loading,
  statusMessage,
  onBuyPremium,
}: PremiumSectionProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border bg-background/80 backdrop-blur p-6 space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Premium Insights</h2>
        <p className="text-sm text-muted-foreground">
          Unlock AI-powered résumé highlights, instant recruiter boosts, and priority support for just $15.
        </p>
      </div>

      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>• Weekly tailored job digests</li>
        <li>• Recruiter-ready résumé polish</li>
        <li>• Priority access to featured roles</li>
      </ul>

      {isAuthenticated ? (
        <Button
          className="w-full md:w-auto"
          onClick={onBuyPremium}
          disabled={loading}
        >
          {loading ? "Creating intent…" : "Buy Premium – $15"}
        </Button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Sign in to upgrade and access premium career tools.
          </p>
          <Button className="w-full md:w-auto" onClick={() => router.push("/api/auth/signin")}>
            Sign in to buy premium
          </Button>
        </div>
      )}

      {statusMessage && (
        <p className="text-sm text-muted-foreground">{statusMessage}</p>
      )}
    </motion.div>
  );
}

