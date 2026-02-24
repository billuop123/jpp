import { BACKEND_URL } from "@/scripts/lib/config";
import type { Job } from "@/components/jobs/types";
import { JobDetailsClient } from "@/components/jobs/JobDetailsClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/scripts/authOptions";
import { redirect } from "next/navigation";

interface JobDetailsPageProps {
  params: Promise<{
    jobid: string;
  }>;
}

async function getJob(jobid: string): Promise<Job> {
  const session = await getServerSession(authOptions);
  const response = await fetch(`${BACKEND_URL}/jobs/${jobid}`, {
    headers: {
      "Content-Type": "application/json",
      ...(session?.token && { Authorization: session.token }),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch job");
  }

  return response.json();
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { jobid } = await params;

  try {
    const job = await getJob(jobid);

    return <JobDetailsClient initialJob={job} jobid={jobid} />;
  } catch (_error) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Failed to load job details</p>
        <Button asChild className="mt-4">
          <Link href="/jobs">Go Back</Link>
        </Button>
      </div>
    );
  }
}

