import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MotionDiv from "@/components/MotionDiv";
import { Card, CardContent } from "@/components/ui/card";

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

interface AnalysisHeaderProps {
  job: Job;
}

export function AnalysisHeader({ job }: AnalysisHeaderProps) {
  const salaryRange = job.salaryMin && job.salaryMax
    ? `${job.salaryMin} - ${job.salaryMax} ${job.salaryCurrency || 'USD'}`
    : 'Not specified';

  return (
    <MotionDiv
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="border !shadow-none bg-white"
        style={{ borderRadius: 0 }}
      >
        <CardContent className="p-6">
          <div className="space-y-3 mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Interview Analysis
            </p>
            <h1 className="text-4xl font-bold">Performance Review</h1>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">{job.title}</h2>
              <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
                {job.company && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">{job.company.name}</span>
                  </div>
                )}
                {job.location && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span>{job.location}</span>
                  </>
                )}
                {job.jobtype && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <Badge variant="outline" className="font-normal !rounded-none" style={{ borderRadius: 0 }}>{job.jobtype.name}</Badge>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm pt-2">
              <div>
                <span className="text-muted-foreground">Salary: </span>
                <span className="font-semibold text-foreground">{salaryRange}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  );
}

