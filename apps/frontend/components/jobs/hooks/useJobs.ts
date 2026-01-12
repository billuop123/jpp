import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  fetchJobs,
  fetchResumeText,
  fetchTopViewedJobs,
  fetchUserDetails,
} from "@/app/lib/queryfunctions/jobsqueryfunctions";
import { JobListItem, JobsResponse } from "../types";

export function useJobs(
  token: string | null,
  role: string | null,
  initialTopViewedJobs?: JobsResponse
) {
  const router = useRouter();
  const canFetchUser = !!token && role === "CANDIDATE";

  const userQuery = useQuery({
    queryKey: ['user-details'],
    enabled: canFetchUser,
    retry: false,
    queryFn: () => fetchUserDetails(token as string),
  });

  useEffect(() => {
    if (userQuery.isError) {
      if (userQuery.error.message === "Invalid token") {
        toast.error("Invalid token, please sign in again");
        router.replace("/api/auth/signin");
      }
      if (userQuery.error.message === "User details not found" && role === "CANDIDATE") {
        toast.error(userQuery.error.message || "Failed to fetch user details");
        router.replace("/user-details");
      }
    }
  }, [userQuery.isError, router, role]);

  useEffect(() => {
    if (userQuery.data && !userQuery.data.resumeLink && role === "CANDIDATE") {
      toast.error("Please upload your resume to view jobs");
      router.replace("/user-details");
    }
  }, [userQuery.data, router, role]);

  const topViewedJobsQuery = useQuery({
    queryKey: ["top-viewed-jobs"],
    retry: false,
    queryFn: () => fetchTopViewedJobs(),
    initialData: initialTopViewedJobs,
    enabled: !initialTopViewedJobs,
  });

  useEffect(() => {
    if (topViewedJobsQuery.isError) {
      toast.error(topViewedJobsQuery.error.message || "Failed to fetch top viewed jobs");
    }
  }, [topViewedJobsQuery.isError]);

  const canFetchResume = canFetchUser && !!userQuery.data?.resumeLink;

  const resumeQuery = useQuery({
    queryKey: ['resume-text'],
    enabled: canFetchResume,
    retry: false,
    queryFn: () => fetchResumeText(token as string)
  });

  useEffect(() => {
    if (resumeQuery.isError) {
      toast.error(resumeQuery.error.message || "Failed to fetch resume text");
      router.replace("/user-details");
    }
  }, [resumeQuery.isError, router]);

  const jobsQuery = useQuery<JobsResponse>({
    queryKey: ['jobs'],
    retry: false,
    enabled: canFetchResume && !!resumeQuery.data,
    queryFn: () => fetchJobs(token as string, resumeQuery.data!.text as any)
  });

  useEffect(() => {
    if (jobsQuery.isError) {
      toast.error(jobsQuery.error.message || "Failed to fetch jobs");
      router.replace("/");
    }
  }, [jobsQuery.isError, router]);

  const topViewedJobs: JobListItem[] = topViewedJobsQuery.data?.jobs || [];
  const semanticJobs: JobListItem[] = jobsQuery.data?.jobs || [];
  const canUseSemantic = !!resumeQuery.data && role === "CANDIDATE" && !!userQuery.data?.resumeLink;

  return {
    userQuery,
    topViewedJobsQuery,
    resumeQuery,
    jobsQuery,
    topViewedJobs,
    semanticJobs,
    canUseSemantic,
    canFetchUser,
    canFetchResume,
  };
}

