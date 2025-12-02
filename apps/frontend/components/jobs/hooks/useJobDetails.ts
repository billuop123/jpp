import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { BACKEND_URL } from "@/scripts/lib/config";
import { Job } from "../types";

export function useJobDetails(jobid: string, initialJob: Job) {
  const { mutate: updateViews } = useMutation({
    mutationFn: (jobId: string) =>
      fetch(`${BACKEND_URL}/jobs/update-views/${jobId}`, {
        method: "PATCH",
      }).then((res) => res.json()),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update views");
    },
  });

  const jobQuery = useQuery<Job>({
    queryKey: ["job", jobid],
    enabled: false, // Use initial data from server
    initialData: initialJob,
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/jobs/${jobid}`);
      const res = await response.json();
      if (!response.ok) throw new Error("Failed to fetch job");
      return res;
    },
  });

  useEffect(() => {
    if (jobQuery.data?.id) {
      updateViews(jobQuery.data.id);
    }
  }, [jobQuery.data?.id, updateViews]);

  return { jobQuery, job: jobQuery.data as Job };
}

