"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useCompanyJobs } from "@/components/company-jobs/useCompanyJobs";
import { CompanyJobsList } from "@/components/company-jobs/CompanyJobsList";
import { PostJobDialog } from "@/components/company-jobs/PostJobDialog";

interface CompanyJobsClientProps {
  companyId?: string;
  token?: string | null;
  userId?: string | null;
}

export function CompanyJobsClient({
  companyId,
  token,
  userId,
}: CompanyJobsClientProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const jobsQuery = useCompanyJobs(companyId, token ?? undefined);

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Please sign in to manage company jobs.
        </p>
        <Button className="mt-4" onClick={() => router.push("/login")}>
          Go to Login
        </Button>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Missing company information.
        </p>
        <Button className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Sign in to manage company jobs.
        </p>
        <Button className="mt-4" onClick={() => router.push("/login")}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              Company Jobs
            </p>
            <h1 className="text-3xl font-semibold mt-1">Manage Job Postings</h1>
            <p className="text-muted-foreground">
              Post new roles and review everything published under this company.
            </p>
          </div>
          <Button size="lg" onClick={() => setIsDialogOpen(true)}>
            Post Job
          </Button>
        </header>

        <CompanyJobsList
          jobs={jobsQuery.data}
          isLoading={jobsQuery.isLoading}
          isError={jobsQuery.isError}
          error={jobsQuery.error as Error | null}
          isRefetching={jobsQuery.isRefetching}
          onRefresh={() => jobsQuery.refetch()}
          userId={userId || ""}
        />
      </div>

      <PostJobDialog
        companyId={companyId}
        token={token}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => jobsQuery.refetch()}
      />
    </div>
  );
}


