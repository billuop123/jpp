"use client";
import { Job } from "./types";

interface ApplicationInfoProps {
  job: Job;
}

export function ApplicationInfo({ job }: ApplicationInfoProps) {
  return (
    <div className="rounded-xl border bg-background/50 backdrop-blur-sm p-6 space-y-4">
      <h3 className="text-xl font-bold">Application Info</h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Views</span>
          <span className="font-medium">{job.views}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Applications</span>
          <span className="font-medium">{job.applicationCount}</span>
        </div>
      </div>
    </div>
  );
}

