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
): Promise<{ applications: ScoringListData[]; jobTitle: string }> {
  const [applicationsResponse, jobResponse] = await Promise.all([
    fetch(`${BACKEND_URL}/applications/scoring-list/${jobId}`, {
      headers: { Authorization: token },
      cache: "no-store",
    }),
    fetch(`${BACKEND_URL}/jobs/${jobId}`, {
      headers: { Authorization: token },
      cache: "no-store",
    }),
  ]);

  if (!applicationsResponse.ok) {
    throw new Error("Failed to fetch applications");
  }
  
  const applications = (await applicationsResponse.json()) as ScoringListData[];
  const job = jobResponse.ok ? await jobResponse.json() : null;
  
  return { applications, jobTitle: job?.title || 'this position' };
}

export default async function RecruiterApplicationsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.token || session.user?.role !== "RECRUITER") {
    redirect("/");
  }

  const { jobId } = await params;

  const { applications, jobTitle } = await getScoringList(jobId, session.token);

  return (
    <RecruiterJobApplicationsPageClient
      jobId={jobId}
      applications={applications}
      token={session.token}
      jobTitle={jobTitle}
    />
  );
}
