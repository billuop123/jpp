import React from 'react';

interface Job {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  company: {
    name: string;
    logo: string | null;
  } | null;
  jobtype: {
    name: string;
  } | null;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string | null;
}

interface InterviewHeaderProps {
  job: Job;
}

export function InterviewHeader({ job }: InterviewHeaderProps) {
  const salaryRange = job.salaryMin && job.salaryMax
    ? `${job.salaryMin} - ${job.salaryMax} ${job.salaryCurrency || 'NPR'}`
    : 'Not specified';

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground uppercase tracking-wide">
          Interview Session
        </p>
        <h1 className="text-3xl font-semibold">Live Interview</h1>
      </div>

      {/* Job Information */}
      <div className="border-t pt-4 space-y-3">
        <div>
          <h2 className="text-xl font-semibold mb-1">{job.title}</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            {job.company && <span>{job.company.name}</span>}
            {job.company && job.location && <span>•</span>}
            {job.location && <span>{job.location}</span>}
            {(job.company || job.location) && job.jobtype && <span>•</span>}
            {job.jobtype && <span>{job.jobtype.name}</span>}
          </div>
        </div>
        
        {job.description && (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Salary: </span>
            <span className="font-medium">{salaryRange}</span>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground pt-2 border-t">
        <p>The interview will last 5 minutes. Answer the interviewer's questions clearly and concisely.</p>
      </div>
    </div>
  );
}

