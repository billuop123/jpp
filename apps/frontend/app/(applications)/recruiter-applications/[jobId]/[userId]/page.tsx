import { BACKEND_URL } from "@/scripts/lib/config";
import type { UserApplicationDetails } from "../../types";
import RecruiterApplicationDetailsPageClient from "@/components/applications/RecruiterApplicationDetailsPageClient";

interface PageProps {
  params: {
    jobId: string;
    userId: string;
  };
}

async function getApplicationDetails(
  jobId: string,
  userId: string
): Promise<UserApplicationDetails> {
      const response = await fetch(
    `${BACKEND_URL}/applications/user-application-details/${jobId}/${userId}`,
    {
      cache: "no-store",
    }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user application details");
      }
      return data as UserApplicationDetails;
}

export default async function RecruiterApplicationsPage({
  params,
}: PageProps) {
  const { jobId, userId } = params;

  const application = await getApplicationDetails(jobId, userId);

  return (
    <RecruiterApplicationDetailsPageClient
      jobId={jobId}
      application={application}
    />
  );
}
