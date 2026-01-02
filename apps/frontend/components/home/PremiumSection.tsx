"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

interface PremiumSectionProps {
  isAuthenticated: boolean;
  loading: boolean;
  statusMessage: string | null;
  onBuyTailoring: () => Promise<void> | void;
  onBuyMock: () => Promise<void> | void;
  onBuyFull: () => Promise<void> | void;
  hasTailoring: boolean;
  hasMock: boolean;
  hasFull: boolean;
}

export default function PremiumSection({
  isAuthenticated,
  loading,
  statusMessage,
  onBuyTailoring,
  onBuyMock,
  onBuyFull,
  hasTailoring,
  hasMock,
  hasFull,
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
        <h2 className="text-2xl font-semibold">Premium options</h2>
        <p className="text-sm text-muted-foreground">
          Choose the plan that fits you best: resume tailoring, mock interviews, or both.
        </p>
      </div>

      {isAuthenticated ? (
        (() => {
          const showTailoring = !hasTailoring;
          const showMock = !hasMock;
          const showFull = !hasFull;
          const hasAnyOption = showTailoring || showMock || showFull;

          if (!hasAnyOption) {
            return (
              <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                You already have access to all premium features.
              </div>
            );
          }

          return (
            <div className="grid gap-4 md:grid-cols-3">
              {showTailoring && (
                <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                  <h3 className="text-sm font-semibold">Tailored Resumes</h3>
                  <p className="text-xs text-muted-foreground">
                    Unlock AI-powered resume tailoring for your job applications.
                  </p>
                  <p className="text-lg font-semibold">$5</p>
                  <Button
                    className="w-full mt-2"
                    onClick={onBuyTailoring}
                    disabled={loading}
                  >
                    {loading ? "Processing…" : "Buy Tailoring"}
                  </Button>
                </div>
              )}

              {showMock && (
                <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                  <h3 className="text-sm font-semibold">Mock Interviews</h3>
                  <p className="text-xs text-muted-foreground">
                    Practice with AI-powered mock interviews to get job-ready.
                  </p>
                  <p className="text-lg font-semibold">$5</p>
                  <Button
                    className="w-full mt-2"
                    onClick={onBuyMock}
                    disabled={loading}
                  >
                    {loading ? "Processing…" : "Buy Mock Interviews"}
                  </Button>
                </div>
              )}

              {showFull && (
                <div className="rounded-xl border bg-primary/5 p-4 space-y-2">
                  <h3 className="text-sm font-semibold">Full Premium</h3>
                  <p className="text-xs text-muted-foreground">
                    Get both tailoring and mock interviews together.
                  </p>
                  <p className="text-lg font-semibold">$8</p>
                  <Button
                    className="w-full mt-2"
                    onClick={onBuyFull}
                    disabled={loading}
                  >
                    {loading ? "Processing…" : "Buy Full Premium"}
                  </Button>
                </div>
              )}
            </div>
          );
        })()
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Sign in to upgrade and access premium career tools.
          </p>
          <Button
            className="w-full md:w-auto"
            onClick={() => router.push("/api/auth/signin")}
          >
            Sign in to view premium plans
          </Button>
        </div>
      )}

      {statusMessage && (
        <p className="text-sm text-muted-foreground">{statusMessage}</p>
      )}
    </motion.div>
  );
}

