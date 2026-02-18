import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { BACKEND_URL } from "@/scripts/lib/config";
import type { ScoringListData } from "@/components/interview/types";
import RecruiterJobApplicationsPageClient from "@/components/applications/RecruiterJobApplicationsPageClient";
import { authOptions } from "@/scripts/authOptions";

interface PageProps {
  params: Promise<{
    jobId: string;
  }>;
}

async function getScoringList(
  jobId: string,
  token: string
): Promise<ScoringListData[]> {
  const response = await fetch(
    `${BACKEND_URL}/applications/scoring-list/${jobId}`,
    {
      headers: {
        Authorization: token,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }
  const data = (await response.json()) as ScoringListData[];
  return data;
}

export default async function RecruiterApplicationsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.token || session.user?.role !== "RECRUITER") {
    redirect("/");
  }

  const { jobId } = await params;

  const applications = await getScoringList(jobId, session.token);

  return (
    <RecruiterJobApplicationsPageClient
      jobId={jobId}
      applications={applications}
    />
  );
}
