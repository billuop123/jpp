"use client";
import { BACKEND_URL } from "@/lib/config";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Button } from "@/components/ui/button";
import LoadingStep from "@/components/LoadingStep";
import { JobHeader } from "@/components/jobs/JobHeader";
import { JobContent } from "@/components/jobs/JobContent";
import { JobSidebar } from "@/components/jobs/JobSidebar";
import { Job } from "@/components/jobs/types";
import { useUser } from "@/store/user";

export default function JobDetailsPage() {
  const { jobid } = useParams<{ jobid: string }>();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [applicationExists, setApplicationExists] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const {token}=useUser()
  const jobQuery = useQuery({
    queryKey: ["job", jobid],
    enabled: !!jobid,
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/jobs/${jobid}`);
      const res = await response.json();
      if (!response.ok) throw new Error("Failed to fetch job");
      return res;
    },
  });
  const applicationExistsQuery=useQuery({
    queryKey: ["application-exists", jobid],
    enabled: !!jobid && !!token,
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/jobs/application-exists`, {
        method: "POST",
        body: JSON.stringify({ jobId: jobid }),
        headers:{
          "Content-Type": "application/json",
          "Authorization": token!
        }
      });
      const res = await response.json();
      setApplicationExists(res.status)
      setApplicationId(res.applicationId || null)
      if (!response.ok) throw new Error(res.message || "Failed to check application exists")
      return res
    },
  })
  if (jobQuery.isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col">
        <LoadingStep message="Loading job details..." />
      </div>
    );
  }
  if (applicationExistsQuery.isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col">
        <LoadingStep message="Checking if you have already applied for this job..." />
      </div>
    );
  }
  if (jobQuery.isError) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Failed to load job details</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }
  if (applicationExistsQuery.isError) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Failed to check if you have already applied for this job</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }
  const job: Job = jobQuery.data;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.4}
        duration={3}
        repeatDelay={1}
        className="[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
      />
      <div className="relative z-10">
        <JobHeader
          job={job}
          isDialogOpen={isDialogOpen}
          onDialogOpenChange={setIsDialogOpen}
          applicationExists={applicationExists}
          applicationId={applicationId}
        />

        <section className="relative container mx-auto px-4 pb-20">
          <AnimatedGridPattern
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
