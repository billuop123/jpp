"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AnimatedGrid from "@/components/home/AnimatedGrid";
import { Button } from "@/components/ui/button";
import LoadingStep from "@/components/LoadingStep";
import { JobHeader } from "@/components/jobs/JobHeader";
import { JobContent } from "@/components/jobs/JobContent";
import { JobSidebar } from "@/components/jobs/JobSidebar";
import { Job } from "@/components/jobs/types";
import { useUser } from "@/store/user";
import { useJobDetails } from "./hooks/useJobDetails";
import { useApplication } from "./hooks/useApplication";
import { useTailorResume } from "./hooks/useTailorResume";
import { usePremiumStatus } from "./hooks/usePremiumStatus";
import { useSession } from "next-auth/react";
import { BACKEND_URL } from "@/scripts/lib/config";

interface JobDetailsClientProps {
  initialJob: Job;
  jobid: string;
}

export function JobDetailsClient({ initialJob, jobid }: JobDetailsClientProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { token } = useUser();
  const {data:session}=useSession()
  const { job } = useJobDetails(jobid, initialJob);
  const { isPremium, isTailoringPremium, isMockInterviewsPremium } = usePremiumStatus(token);
  const { applicationExistsQuery, canApply, applicationMessage } = useApplication(jobid, token);
  const { tailorResumeMutation } = useTailorResume(jobid, token, job?.title);

  const myApplicationStatusQuery = useQuery<{
    exists: boolean;
    status?: string;
    applicationId?: string;
  }>({
    queryKey: ["my-application-status", jobid],
    enabled: !!jobid && !!token,
    retry: false,
    queryFn: async () => {
      const response = await fetch(
        `${BACKEND_URL}/applications/my-status/${jobid}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token!,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch application status");
      }
      return data as {
        exists: boolean;
        status?: string;
        applicationId?: string;
      };
    },
  });

  const canInterview =
    myApplicationStatusQuery.data?.exists &&
    myApplicationStatusQuery.data.status === "GRANTED" &&
    !!myApplicationStatusQuery.data.applicationId;

  const interviewApplicationId = canInterview
    ? myApplicationStatusQuery.data?.applicationId ?? null
    : null;

  if (applicationExistsQuery.isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col">
        <LoadingStep message="Checking if you have already applied for this job..." />
      </div>
    );
  }

  if (applicationExistsQuery.isError) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
        <p className="text-muted-foreground">
          Failed to check if you have already applied for this job
        </p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <AnimatedGrid
        numSquares={30}
        maxOpacity={0.4}
        duration={3}
        repeatDelay={1}
        className="[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
      />
      {session?.user?.role === "CANDIDATE" && (
        <div className="fixed top-4 right-4 z-20 flex flex-col items-end gap-2">
          {(isPremium || isTailoringPremium) && (
            <Button
              disabled={!token || tailorResumeMutation.isPending}
              onClick={() => tailorResumeMutation.mutate()}
            >
              {tailorResumeMutation.isPending ? "Generating..." : "Tailor Resume"}
            </Button>
          )}
          {(isPremium || isMockInterviewsPremium) && (
            <Button
              variant="outline"
              disabled={!token}
              onClick={() => router.push(`/mock/${jobid}`)}
            >
              Start Mock Interview
            </Button>
          )}
        </div>
      )}
      <div className="relative z-10">
        <JobHeader
          job={job}
          isDialogOpen={isDialogOpen}
          onDialogOpenChange={setIsDialogOpen}
          canApply={canApply}
          applicationMessage={applicationMessage}
          canInterview={canInterview}
          interviewApplicationId={interviewApplicationId}
        />

        <section className="relative container mx-auto px-4 pb-20">
          <AnimatedGrid
            numSquares={25}
            maxOpacity={0.15}
            duration={5}
            repeatDelay={0.8}
            className="absolute inset-0 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
          />
          <div className="relative max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <JobContent job={job} />
              <JobSidebar job={job} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

