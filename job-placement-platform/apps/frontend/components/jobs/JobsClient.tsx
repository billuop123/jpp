"use client";

import { useEffect, useState } from "react";

import LoadingStep from "@/components/LoadingStep";
import { useUser } from "@/store/user";
import AnimatedGrid from "@/components/home/AnimatedGrid";
import JobsHeader from "./JobsHeader";
import JobsGrid from "./JobsGrid";
import { useJobs } from "./hooks/useJobs";
import { useJobSource } from "./hooks/useJobSource";
import type { JobsResponse, JobFilters, JobListItem } from "./types";
import { JobsFilters } from "./JobsFilters";

interface JobsClientProps {
  initialTopViewedJobs: JobsResponse | null;
}

export default function JobsClient({ initialTopViewedJobs }: JobsClientProps) {
  const { token, role } = useUser();
  const [filters, setFilters] = useState<JobFilters>({
    location: "",
    jobType: "",
    remote: "any",
  });
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const {
    userQuery,
    topViewedJobsQuery,
    resumeQuery,
    jobsQuery,
    topViewedJobs,
    semanticJobs,
    canUseSemantic,
    canFetchUser,
    canFetchResume,
  } = useJobs(token, role, initialTopViewedJobs ?? undefined);

  const { jobSource, setJobSource } = useJobSource(canUseSemantic);

  // Reset pagination when source or filters change
  useEffect(() => {
    setPage(1);
  }, [jobSource, filters.location, filters.jobType, filters.remote]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!initialTopViewedJobs && topViewedJobsQuery.isPending) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col">
        <LoadingStep message="Loading top viewed jobs..." />
      </div>
    );
  }

  if (canFetchUser && userQuery.isPending) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col">
        <LoadingStep message="Checking user profile..." />
      </div>
    );
  }

  if (userQuery.data && !userQuery.data.resumeLink) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col">
        <LoadingStep message="Redirecting to resume upload..." />
      </div>
    );
  }

  if (canFetchResume && resumeQuery.isPending) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col">
        <LoadingStep message="Extracting resume text..." />
      </div>
    );
  }

  if (jobSource === "semantic" && jobsQuery.isPending) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col">
        <LoadingStep message="Loading jobs..." />
      </div>
    );
  }

  if (jobSource === "semantic" && !resumeQuery.data) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col">
        <LoadingStep message="No resume data available..." />
      </div>
    );
  }

  const displayJobs = jobSource === "semantic" ? semanticJobs : topViewedJobs;
  const filteredJobs = applyFilters(displayJobs, filters);
  const showSourceSelector = canUseSemantic && topViewedJobs.length > 0;

  const total = filteredJobs.length;
  const totalPages =
    jobSource === "semantic" ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const currentPage =
    jobSource === "semantic" ? Math.min(page, totalPages) : 1;
  const startIndex =
    jobSource === "semantic" ? (currentPage - 1) * pageSize : 0;
  const endIndex =
    jobSource === "semantic" ? startIndex + pageSize : filteredJobs.length;

  const paginatedJobs =
    jobSource === "semantic"
      ? filteredJobs.slice(startIndex, endIndex)
      : filteredJobs;

  const canShowPagination =
    jobSource === "semantic" && total > pageSize;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <AnimatedGrid
        numSquares={30}
        maxOpacity={0.4}
        duration={3}
        repeatDelay={1}
        className="[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
      />
      <div className="relative z-10">
        <JobsHeader
          jobSource={jobSource}
          displayJobsCount={filteredJobs.length}
          showSourceSelector={showSourceSelector}
          onSourceChange={setJobSource}
        />
        <JobsFilters
          filters={filters}
          onFiltersChange={(next) => setFilters(next)}
        />
        <JobsGrid jobs={paginatedJobs} formatDate={formatDate} />

        {canShowPagination && (
          <div className="mt-3 mb-8 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <button
              className="inline-flex items-center rounded-md border px-2 py-1 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="inline-flex items-center rounded-md border px-2 py-1 disabled:opacity-50"
              onClick={() =>
                setPage((p) => (p < totalPages ? p + 1 : p))
              }
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function applyFilters(jobs: JobListItem[], filters: JobFilters): JobListItem[] {
  return jobs.filter((job) => {
    if (
      filters.location &&
      !job.location.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }
    if (filters.jobType && job.jobtype.name !== filters.jobType) {
      return false;
    }
    if (filters.remote === "remote" && !job.isRemote) {
      return false;
    }
    if (filters.remote === "onsite" && job.isRemote) {
      return false;
    }
    return true;
  });
}


