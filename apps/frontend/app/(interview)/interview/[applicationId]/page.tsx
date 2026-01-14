import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { BACKEND_URL } from "@/scripts/lib/config";
import { authOptions } from "@/scripts/authOptions";
import type { ApplicationData } from "@/components/interview/types";
import InterviewPageClient from "@/components/interview/InterviewPageClient";

interface PageProps {
  params: {
    applicationId: string;
  };
}

async function checkInterviewExists(applicationId: string): Promise<boolean> {
  const response = await fetch(
    `${BACKEND_URL}/applications/${applicationId}/interview-exists`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

      if (!response.ok) {
    throw new Error("Failed to check if interview exists");
      }
  const status = await response.json();
  return !!status.status;
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

async function getClientKey(token: string): Promise<string> {
      const response = await fetch(`${BACKEND_URL}/vapi/client-key`, {
        headers: {
      Authorization: token,
        },
    cache: "no-store",
      });
      if (!response.ok) {
    throw new Error("Failed to get VAPI client key");
  }
  const data = await response.json();
  return data.key as string;
}

export default async function InterviewPage({ params }: PageProps) {
  const { applicationId } = params;

  const session = await getServerSession(authOptions);
  const token = session?.token ?? null;

  // If interview already exists, redirect to analysis
  const exists = await checkInterviewExists(applicationId);
  if (exists) {
    redirect(`/interview/analysis/${applicationId}`);
  }

  let application: ApplicationData | null = null;
  let clientKey: string | null = null;

  if (token) {
    [application, clientKey] = await Promise.all([
      getApplication(applicationId, token),
      getClientKey(token),
    ]);
  }

  return (
    <InterviewPageClient
      applicationId={applicationId}
      token={token}
      initialApplication={application}
      clientKey={clientKey}
        />
  );
}

