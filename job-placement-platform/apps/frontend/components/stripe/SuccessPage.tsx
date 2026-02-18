"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { BACKEND_URL } from "@/scripts/lib/config";
import { useUser } from "@/store/user";
import { Button } from "@/components/ui/button";

type StatusState = "idle" | "checking" | "success" | "error";

export default function SuccessPageClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { token, email } = useUser();
  const [status, setStatus] = useState<StatusState>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token || !sessionId || !email) return;

    const verifySession = async () => {
      setStatus("checking");
      setMessage("");

      try {
        const response = await fetch(
          `${BACKEND_URL}/stripe/check-session?session_id=${sessionId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,

            },
            method: "POST",
            body: JSON.stringify({ customer_email: email }),
          }
        );

        const raw = await response.text();
        let data: any = {};
        if (raw) {
          try {
            data = JSON.parse(raw);
          } catch (parseError) {
            console.error("Failed to parse Stripe verification response:", parseError);
            data = {};
          }
        }

        if (!response.ok) {
          throw new Error(data?.message || "Unable to verify payment.");
        }
        if (data?.success) {
          setStatus("success");
          setMessage("Premium membership activated successfully.");
        } else {
          setStatus("error");
          setMessage(
            data?.message || "Payment verification failed. Please contact support."
          );
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Unexpected error verifying payment.");
      }
    };

    verifySession();
  }, [sessionId, token, email]);

  const headline =
    status === "success"
      ? "Payment Successful"
      : status === "error"
      ? "Verification Failed"
      : "Verifying your payment…";

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-xl w-full rounded-2xl border bg-background/80 backdrop-blur p-8 space-y-6 text-center">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Premium Upgrade
          </p>
          <h1 className="text-3xl font-semibold mt-2">{headline}</h1>
        </div>

        {/* {sessionId && (
          <p className="text-xs font-mono break-all text-muted-foreground">
            Session ID: <span className="text-primary">{sessionId}</span>
          </p>
        )} */}

        <p className="text-sm text-muted-foreground min-h-[2rem]">
          {message ||
            "Please wait while we confirm your payment. This usually takes just a moment."}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild disabled={status !== "success"}>
            <Link href="/jobs">Explore Jobs</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}