"use client";

import { Button } from "@/components/ui/button";

interface CompanyDetailsHeaderProps {
  name?: string;
  onBack: () => void;
  onGoToJobs?: () => void;
}

export function CompanyDetailsHeader({
  name,
  onBack,
  onGoToJobs,
}: CompanyDetailsHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-wide">
          Company
        </p>
        <h1 className="text-3xl font-semibold">
          {name || "Company details"}
        </h1>
        <p className="text-muted-foreground">
          View profile information and manage jobs for this company.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        {onGoToJobs && (
          <Button onClick={onGoToJobs}>
            Go to jobs
          </Button>
        )}
      </div>
    </header>
  );
}


