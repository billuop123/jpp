"use client";

import { useRouter } from "next/navigation";

import type { Job } from "@/components/jobs/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CompanyJobsListProps {
  jobs: Job[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isRefetching: boolean;
  onRefresh: () => void;
  userId: string;
}

export function CompanyJobsList({
  jobs,
  isLoading,
  isError,
  error,
  isRefetching,
  onRefresh,
  userId,
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

        {!isLoading && !isError && jobs && jobs.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Work Type</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.location || "Location TBD"}</TableCell>
                    <TableCell>{job.isRemote ? "Remote" : "Onsite"}</TableCell>
                    <TableCell>
                      {job.deadline
                        ? new Date(job.deadline).toLocaleDateString()
                        : "–"}
                    </TableCell>
                    <TableCell>
                      {job.createdAt
                        ? new Date(job.createdAt).toLocaleDateString()
                        : "–"}
                    </TableCell>
                    <TableCell>
                      {job.salaryMin && job.salaryMax
                        ? `${job.salaryMin}-${job.salaryMax} ${
                            job.salaryCurrency ?? ""
                          }`
                        : "Not specified"}
                    </TableCell>
                    <TableCell>{job.views ?? 0}</TableCell>
                    <TableCell className="space-x-2 text-right">
                      {job.company.userId === userId && (
                        <>
                        <Link
                          href={`/recruiter-applications/${job.id}`}
                          className="text-xs text-foreground"
                        >
                          View applications
                        </Link>
                        <Link
                          href={`/application-requests/${job.id}`}
                          className="text-xs text-foreground"
                        >
                          View application requests
                        </Link>
                          </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/jobs/${job.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </section>
  );
}


