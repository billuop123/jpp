"use client";
import { FileText, CheckCircle2, Briefcase } from "lucide-react";
import { JobContentSection } from "./JobContentSection";
import { JobSkills } from "./JobSkills";
import { Job } from "./types";

interface JobContentProps {
  job: Job;
}

export function JobContent({ job }: JobContentProps) {
  return (
    <div className="lg:col-span-2 space-y-8">
      {job.description && (
        <JobContentSection
          title="Job Description"
          content={job.description}
          icon={FileText}
          delay={0.2}
        />
      )}

      {job.responsibilities && (
        <JobContentSection
          title="Responsibilities"
          content={job.responsibilities}
          icon={CheckCircle2}
          delay={0.3}
        />
      )}

      {job.requirements && (
        <JobContentSection
          title="Requirements"
          content={job.requirements}
          icon={Briefcase}
          delay={0.4}
        />
      )}

      {job.benefits && (
        <JobContentSection
          title="Benefits"
          content={job.benefits}
          icon={CheckCircle2}
          delay={0.5}
        />
      )}

      <JobSkills skills={job.skills} delay={0.6} />
    </div>
  );
}

