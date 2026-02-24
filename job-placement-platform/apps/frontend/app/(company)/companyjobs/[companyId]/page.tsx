import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/scripts/authOptions";
import { CompanyJobsClient } from "./CompanyJobsClient";
import { BACKEND_URL } from "@/scripts/lib/config";
import type { Job } from "@/components/jobs/types";

interface PageProps {
  params: Promise<{
    companyId: string;
  }>;
}

async function ensureRecruiterForCompany(
  companyId: string,
  token: string
): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/company/is-recruiter/${companyId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
      Authorization: token,
        },
        cache: "no-store",
  });

    if (!res.ok) {
      redirect("/");
    }

    const data = await res.json();
    if (!data?.status) {
      redirect("/");
    }
}

async function getCompanyJobs(
  companyId: string,
  token: string
): Promise<Job[]> {
  const response = await fetch(
    `${BACKEND_URL}/company/company-jobs/${companyId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      cache: "no-store",
    }
  );
  const raw = await response.json();
  if (!response.ok) {
    throw new Error(raw.message || "Failed to fetch company jobs");
  }

  const jobIds: { id: string }[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.jobs)
    ? raw.jobs
    : [];

  if (!jobIds.length) {
    return [];
  }

  const jobs = await Promise.all(
    jobIds.map(async ({ id }) => {
      const res = await fetch(`${BACKEND_URL}/jobs/${id}`, {
        cache: "no-store",
        headers:{
          Authorization:token
        }
      });
      const job = await res.json();
      if (!res.ok) {
        throw new Error(job.message || `Failed to fetch job ${id}`);
      }
      return job as Job;
    })
  );

  return jobs;
}

export default async function CompanyJobsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.token || !session.user?.id || session.user.role !== "RECRUITER") {
    redirect("/");
  }

  const { companyId } = await params;

  await ensureRecruiterForCompany(companyId, session.token);

  const jobs = await getCompanyJobs(companyId, session.token);

  return (
    <CompanyJobsClient
      companyId={companyId}
      token={session.token}
      userId={session.user.id}
      initialJobs={jobs}
    />
  );
}

