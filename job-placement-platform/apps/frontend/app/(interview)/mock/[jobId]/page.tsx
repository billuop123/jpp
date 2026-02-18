import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/scripts/authOptions";
import { BACKEND_URL } from "@/scripts/lib/config";
import type { Job } from "@/components/jobs/types";
import MockInterviewPageClient from "@/components/interview/MockInterviewPageClient";

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

async function getClientKey(sessionToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/vapi/client-key`, {
      headers: {
        Authorization: sessionToken,
      },
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.key as string;
  } catch {
    return null;
  }
}

async function getJob(jobId: string): Promise<Job | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/jobs/${jobId}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as Job;
  } catch {
    return null;
  }
}

async function startMockInterview(
  jobId: string,
  sessionToken: string
): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/mock-interviews/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: sessionToken,
      },
      cache: "no-store",
      body: JSON.stringify({ jobId }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || "Failed to start mock interview");
    }
    return data.id as string;
  } catch (error) {
    console.error("startMockInterview error:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function MockInterviewPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.token || session.user?.role !== "CANDIDATE") {
    redirect("/login");
  }

  const premiumStatus = await getPremiumStatus(session.token);
  const hasMockAccess =
    !!premiumStatus?.isPremium || !!premiumStatus?.isMockInterviewsPremium;

  if (!hasMockAccess) {
    redirect("/premium");
  }

  const { jobId } = await params;

  const [clientKey, job, mockInterviewId] = await Promise.all([
    getClientKey(session.token),
    getJob(jobId),
    startMockInterview(jobId, session.token),
  ]);

  if (!mockInterviewId) {
    // If we couldn't start a mock interview (likely premium or job issue),
    // send the user back to the job page instead of crashing the app.
    redirect(`/jobs/${jobId}`);
  }

  return (
    <MockInterviewPageClient
      jobId={jobId}
      mockInterviewId={mockInterviewId}
      token={session.token}
      clientKey={clientKey}
      initialJob={job}
    />
  );
}

