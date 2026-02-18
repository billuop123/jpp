 "use client";

import { useQuery } from "@tanstack/react-query";

import { BACKEND_URL } from "@/scripts/lib/config";
import { useUser } from "@/store/user";
import type { JobFilters } from "./types";

interface JobsFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
}

interface JobTypeApi {
  id: string;
  name: string;
  description?: string | null;
}

export function JobsFilters({ filters, onFiltersChange }: JobsFiltersProps) {
  const { token } = useUser();

  const jobTypesQuery = useQuery<JobTypeApi[]>({
    queryKey: ["job-types"],
    enabled: !!token,
    retry: false,
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/jobs/types`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token as string,
        },
      });
      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message || "Failed to load job types");
      }
      return res as JobTypeApi[];
    },
  });

  const jobTypes = jobTypesQuery.data ?? [];

  return (
    <section className="container mx-auto px-4 pb-6 -mt-6">
      <div className="mx-auto max-w-5xl rounded-2xl border bg-background/80 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-foreground">Filter jobs</p>
          <p className="text-xs text-muted-foreground md:text-right">
            Narrow results by location, job type, and remote preference.
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col items-start gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Location
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  location: e.target.value,
                })
              }
              placeholder="e.g. Kathmandu"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div className="flex flex-col items-start gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Job type
            </label>
            <select
              value={filters.jobType}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  jobType: e.target.value,
                })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              disabled={!token || jobTypesQuery.isLoading || jobTypesQuery.isError}
            >
              <option value="">
                {!token
                  ? "Sign in to filter by job type"
                  : jobTypesQuery.isLoading
                  ? "Loading job types..."
                  : jobTypesQuery.isError
                  ? "All job types"
                  : "All job types"}
              </option>
              {jobTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col items-start gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Remote / On-site
            </label>
            <select
              value={filters.remote}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  remote: e.target.value as JobFilters["remote"],
                })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="any">Any</option>
              <option value="remote">Remote only</option>
              <option value="onsite">On-site only</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}


