"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BACKEND_URL } from "@/scripts/lib/config";
import PremiumSection from "@/components/home/PremiumSection";
import type { Session } from "next-auth";
import { useUser } from "@/store/user";
import { usePremiumStatus } from "@/components/jobs/hooks/usePremiumStatus";

interface Props {
  session: Session | null;
  isAuthenticated: boolean;
}

export default function PremiumSectionWithCheckout({ session, isAuthenticated }: Props) {
  const [premiumStatus, setPremiumStatus] = useState<string | null>(null);
  const [loadingPremium, setLoadingPremium] = useState(false);
  const router = useRouter();
  const { token } = useUser();
  const {
    isPremium,
    isTailoringPremium,
    isMockInterviewsPremium,
  } = usePremiumStatus(token);

  const hasFull =
    !!isPremium || (!!isTailoringPremium && !!isMockInterviewsPremium);
  const hasTailoring = !!isPremium || !!isTailoringPremium;
  const hasMock = !!isPremium || !!isMockInterviewsPremium;

  type PlanType = "TAILORING" | "MOCK" | "FULL";

  const handleBuy = async (planType: PlanType) => {
    if (!session?.user?.email) {
      toast.error("Please sign in to upgrade to premium.");
      router.push("/api/auth/signin");
      return;
    }

    setLoadingPremium(true);
    setPremiumStatus(null);

    try {
      const checkoutRes = await fetch(`${BACKEND_URL}/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success_url: `${window.location.origin}/premium/success`,
          cancel_url: `${window.location.origin}/premium/canceled`,
          planType,
          customer_email: session.user.email,
        }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        throw new Error(checkoutData.message || "Unable to create checkout session.");
      }

      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error("Stripe checkout URL missing in response.");
      }
    } catch (error: any) {
      setPremiumStatus(error.message || "Unexpected error creating checkout session.");
    } finally {
      setLoadingPremium(false);
    }
  };

  return (
    <PremiumSection
      isAuthenticated={isAuthenticated}
      loading={loadingPremium}
      statusMessage={premiumStatus}
      onBuyTailoring={() => handleBuy("TAILORING")}
      onBuyMock={() => handleBuy("MOCK")}
      onBuyFull={() => handleBuy("FULL")}
      hasTailoring={hasTailoring}
      hasMock={hasMock}
      hasFull={hasFull}
    />
  );
}



