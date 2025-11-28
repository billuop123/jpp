"use client";

import { useRouter } from "next/navigation";

import { Job } from "@/components/jobs/types";
import { Button } from "@/components/ui/button";

interface CompanyJobsListProps {
  jobs: Job[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isRefetching: boolean;
  onRefresh: () => void;
}

export function CompanyJobsList({
  jobs,
  isLoading,
  isError,
  error,
  isRefetching,
  onRefresh,
}: CompanyJobsListProps) {
  const router = useRouter();

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Posted Jobs</h2>
          <p className="text-sm text-muted-foreground">
            {jobs?.length
              ? `You have ${jobs.length} active ${
                  jobs.length === 1 ? "listing" : "listings"
                }.`
              : "No jobs posted yet."}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={onRefresh}
          disabled={isRefetching}
        >
          {isRefetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading && <p className="text-muted-foreground">Loading jobs...</p>}

        {isError && (
          <p className="text-destructive">
            {error?.message || "Failed to load jobs"}
          </p>
        )}

        {!isLoading && !isError && !jobs?.length && (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Post your first role to see it show up here.
          </div>
        )}

        {jobs?.map((job) => (
          <article
            key={job.id}
            className="rounded-xl border bg-background p-4 transition hover:border-foreground/40"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {job.location || "Location TBD"} ·{" "}
                  {job.isRemote ? "Remote" : "Onsite"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                View
              </Button>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Deadline</dt>
                <dd className="font-medium">
                  {job.deadline
                    ? new Date(job.deadline).toLocaleDateString()
                    : "–"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">
                  {job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString()
                    : "–"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Salary</dt>
                <dd className="font-medium">
                  {job.salaryMin && job.salaryMax
                    ? `${job.salaryMin}-${job.salaryMax} ${
                        job.salaryCurrency ?? ""
                      }`
                    : "Not specified"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Views</dt>
                <dd className="font-medium">{job.views ?? 0}</dd>
              </div>
            </dl>
            {job.skills?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={`${job.id}-${skill}`}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}


