import { getServerSession } from "next-auth";

import HomePage from "../components/home/HomePage";
import { authOptions } from "@/scripts/authOptions";
import { BACKEND_URL } from "@/scripts/lib/config";

type PremiumStatus = {
  isPremium: boolean;
  isTailoringPremium?: boolean;
  isMockInterviewsPremium?: boolean;
};

async function getPremiumStatus(
  sessionToken: string | undefined
): Promise<PremiumStatus | null> {
  if (!sessionToken) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/users/is-premium`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: sessionToken,
      },
      // Always get fresh premium status
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as PremiumStatus;

    return {
      isPremium: !!data.isPremium,
      isTailoringPremium: !!data.isTailoringPremium,
      isMockInterviewsPremium: !!data.isMockInterviewsPremium,
    };
  } catch {
    return null;
  }
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const premiumStatus = await getPremiumStatus(session?.token);

  return <HomePage session={session} premiumStatus={premiumStatus} />;
}
