import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { BACKEND_URL } from "@/scripts/lib/config";

export function useTailorResume(jobid: string, token: string | null, jobTitle?: string) {
  const tailorResumeMutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error("Sign in to tailor your resume");
      }
      const response = await fetch(`${BACKEND_URL}/resume-tailoring/${jobid}`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });
      if (!response.ok) {
        let errorMessage = "Failed to tailor resume";
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.message || errorMessage;
        } catch (error) {
          // ignore body parse errors
        }
        throw new Error(errorMessage);
      }
      return await response.blob();
    },
    onSuccess: (blob) => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${jobTitle ?? "tailored"}-resume.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Tailored resume generated!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to tailor resume");
    },
  });

  return { tailorResumeMutation };
}

