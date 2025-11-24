"use client";
import { MapPin, Calendar, DollarSign, Clock } from "lucide-react";
import { Job } from "./types";
import { formatDate, formatSalary } from "./utils";

interface JobOverviewProps {
  job: Job;
}

export function JobOverview({ job }: JobOverviewProps) {
  return (
    <div className="rounded-xl border bg-background/50 backdrop-blur-sm p-6 space-y-4">
      <h3 className="text-xl font-bold">Job Overview</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Salary</p>
            <p className="font-medium">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="font-medium">
              {job.isRemote ? "Remote" : job.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Posted</p>
            <p className="font-medium">{formatDate(job.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Deadline</p>
            <p className="font-medium">{formatDate(job.deadline)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

