import { BACKEND_URL } from "@/scripts/lib/config";
import type { ScoringListData } from "@/components/interview/types";
import RecruiterJobApplicationsPageClient from "@/components/applications/RecruiterJobApplicationsPageClient";

interface PageProps {
  params: {
    jobId: string;
  };
}

async function getScoringList(jobId: string): Promise<ScoringListData[]> {
      const response = await fetch(
    `${BACKEND_URL}/applications/scoring-list/${jobId}`,
    {
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
  const { jobId } = params;

  const applications = await getScoringList(jobId);

  return (
    <RecruiterJobApplicationsPageClient jobId={jobId} applications={applications} />
                  );
}
