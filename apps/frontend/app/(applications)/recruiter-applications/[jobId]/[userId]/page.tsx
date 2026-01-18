import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { BACKEND_URL } from "@/scripts/lib/config";
import type { UserApplicationDetails } from "../../types";
import RecruiterApplicationDetailsPageClient from "@/components/applications/RecruiterApplicationDetailsPageClient";
import { authOptions } from "@/scripts/authOptions";

interface PageProps {
  params: Promise<{
    jobId: string;
    userId: string;
  }>;
}

async function getApplicationDetails(
  jobId: string,
  userId: string,
  token: string
): Promise<UserApplicationDetails> {
  const response = await fetch(
    `${BACKEND_URL}/applications/user-application-details/${jobId}/${userId}`,
    {
      headers: {
        Authorization: token,
      },
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
  const session = await getServerSession(authOptions);

  if (!session?.token || session.user?.role !== "RECRUITER") {
    redirect("/");
  }

  const { jobId, userId } = await params;

  const application = await getApplicationDetails(jobId, userId, session.token);

  return (
    <RecruiterApplicationDetailsPageClient
      jobId={jobId}
      application={application}
    />
  );
}
