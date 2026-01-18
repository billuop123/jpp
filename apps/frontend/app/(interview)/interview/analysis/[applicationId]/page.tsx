import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { BACKEND_URL } from "@/scripts/lib/config";
import { authOptions } from "@/scripts/authOptions";
import type { ApplicationData } from "@/components/interview/types";
import AnalysisPageClient from "@/components/interview/AnalysisPageClient";

interface PageProps {
  params: Promise<{
    applicationId: string;
  }>;
}

async function getApplication(
  applicationId: string,
  token: string
): Promise<ApplicationData> {
      const response = await fetch(`${BACKEND_URL}/applications/${applicationId}`, {
        headers: {
      Authorization: token,
        },
    cache: "no-store",
      });
  if (!response.ok) {
    throw new Error("Failed to fetch application details");
  }
  return (await response.json()) as ApplicationData;
}

export default async function AnalysisPage({ params }: PageProps) {
  const { applicationId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.token) {
    redirect("/login");
  }

  const application = await getApplication(applicationId, session.token);

  return <AnalysisPageClient application={application} />;
}
