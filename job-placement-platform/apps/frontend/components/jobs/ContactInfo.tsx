"use client";
import { Mail, Globe } from "lucide-react";
import { Job } from "./types";

interface ContactInfoProps {
  job: Job;
}

export function ContactInfo({ job }: ContactInfoProps) {
  if (!job.contactEmail && !job.applicationurl) return null;

  return (
    <div className="rounded-xl border bg-background/50 backdrop-blur-sm p-6 space-y-4">
      <h3 className="text-xl font-bold">Contact</h3>
      <div className="space-y-3">
        {job.contactEmail && (
          <a
            href={`mailto:${job.contactEmail}`}
            className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
          >
            <Mail className="w-5 h-5 text-muted-foreground" />
            <span>{job.contactEmail}</span>
          </a>
        )}
        {job.applicationurl && (
          <a
            href={job.applicationurl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
          >
            <Globe className="w-5 h-5 text-muted-foreground" />
            <span>Apply via Website</span>
          </a>
        )}
      </div>
    </div>
  );
}

