import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BACKEND_URL } from "@/scripts/lib/config";

interface ApplicationExistsResponse {
  status: boolean;
  applicationId: string | null;
}

export function useApplication(jobid: string, token: string | null) {
  const queryClient = useQueryClient();

  const applicationExistsQuery = useQuery<ApplicationExistsResponse>({
    queryKey: ["application-exists", jobid],
    enabled: !!jobid && !!token,
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/jobs/application-exists`, {
        method: "POST",
        body: JSON.stringify({ jobId: jobid }),
        headers: {
          "Content-Type": "application/json",
          "Authorization": token!,
        },
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || "Failed to check application exists");
      return res;
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (data: { coverLetter: string; notes: string }) => {
      const response = await fetch(`${BACKEND_URL}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token!,
        },
        body: JSON.stringify({
          jobId: jobid,
          coverLetter: data.coverLetter,
          notes: data.notes,
        }),
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || "Failed to apply for job");
      return res;
    },
    onSuccess: async (data) => {
      toast.success("Application submitted successfully!");
      // Invalidate and refetch the application exists query to get the latest data
      await queryClient.invalidateQueries({ queryKey: ["application-exists", jobid] });
      // Refetch immediately to update the UI
      await queryClient.refetchQueries({ queryKey: ["application-exists", jobid] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to apply for job");
    },
  });

  const applicationExists = applicationExistsQuery.data?.status ?? false;
  const applicationId = applicationExistsQuery.data?.applicationId ?? null;

  return {
    applicationExistsQuery,
    applicationExists,
    applicationId,
    applyMutation,
  };
}

