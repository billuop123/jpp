import { getServerSession } from "next-auth";

import JobsClient from "@/components/jobs/JobsClient";
import { authOptions } from "@/scripts/authOptions";
import { BACKEND_URL } from "@/scripts/lib/config";
import type { JobsResponse } from "@/components/jobs/types";

async function getTopViewedJobs(): Promise<JobsResponse | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/jobs/top-viewed-jobs`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as JobsResponse;
    return data;
  } catch {
    return null;
  }
}

export default async function JobsPage() {
  await getServerSession(authOptions);

  const topViewedJobs = await getTopViewedJobs();

  return <JobsClient initialTopViewedJobs={topViewedJobs} />;
}

