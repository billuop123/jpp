import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/scripts/authOptions";
import { BACKEND_URL } from "@/scripts/lib/config";
import type { ApplicationData } from "@/components/interview/types";
import AnalysisPageClient from "@/components/interview/AnalysisPageClient";

interface PageProps {
  params: Promise<{
    mockInterviewId: string;
  }>;
}

async function getMockInterview(
  mockInterviewId: string,
  token: string
): Promise<ApplicationData | null> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/mock-interviews/${mockInterviewId}`,
      {
        headers: {
          Authorization: token,
        },
        cache: "no-store",
      }
    );
    if (!response.ok) {
      return null;
    }
    // Shape is compatible with ApplicationData for our UI needs
    return (await response.json()) as ApplicationData;
  } catch {
    return null;
  }
}

export default async function MockInterviewAnalysisPage({
  params,
}: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.token) {
    redirect("/login");
  }

  const { mockInterviewId } = await params;

  const application = await getMockInterview(mockInterviewId, session.token);

  if (!application) {
    return (
      <AnalysisPageClient
        application={null}
        isLoading={false}
        errorMessage="Failed to load mock interview analysis."
      />
    );
  }

  return <AnalysisPageClient application={application} />;
}

