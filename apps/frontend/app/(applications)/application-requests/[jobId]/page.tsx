import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/scripts/authOptions";
import { BACKEND_URL } from "@/scripts/lib/config";
import ApplicationRequestsPageClient, {
  PendingApplication,
} from "@/components/applications/ApplicationRequestsPageClient";

interface PageProps {
  params: Promise<{
    jobId: string;
  }>;
}

async function getPendingRequests(
  jobId: string,
  token: string
): Promise<PendingApplication[]> {
      const response = await fetch(
        `${BACKEND_URL}/jobs/pending-requests/${jobId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
        Authorization: token,
          },
      cache: "no-store",
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch application requests");
      }

      return data as PendingApplication[];
}

export default async function ApplicationRequestsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.token) {
    redirect("/login");
      }

  const { jobId } = await params;

  const requests = await getPendingRequests(jobId, session.token);

  return (
    <ApplicationRequestsPageClient
      jobId={jobId}
      token={session.token}
      initialRequests={requests}
    />
  );
}
