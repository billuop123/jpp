"use client";

import { useQuery } from "@tanstack/react-query";

import { BACKEND_URL } from "@/scripts/lib/config";
import { Job } from "@/components/jobs/types";

export function useCompanyJobs(
  companyId?: string,
  token?: string | null,
  initialJobs?: Job[]
) {
  return useQuery<Job[]>({
    queryKey: ["company-jobs", companyId],
    enabled: Boolean(companyId && token) && initialJobs === undefined,
    initialData: initialJobs,
    queryFn: async () => {
      const response = await fetch(
        `${BACKEND_URL}/company/company-jobs/${companyId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token!,
          },
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
          const res = await fetch(`${BACKEND_URL}/jobs/${id}`);
          const job = await res.json();
          if (!res.ok) {
            throw new Error(job.message || `Failed to fetch job ${id}`);
          }
          return job as Job;
        })
      );

      return jobs;
    },
  });
}


