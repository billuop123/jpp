import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { BACKEND_URL } from "@/scripts/lib/config";
import { ExtractedData, Step } from "../types";

interface UseResumeUploadOptions {
  onSuccess?: () => void;
}

export function useResumeUpload(token: string | null, options?: UseResumeUploadOptions) {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${BACKEND_URL}/upload-pdf`, {
        method: "PUT",
        body: formData,
        headers: token ? { Authorization: token! } : undefined,
      });

      if (!response.ok) {
        throw new Error("Failed to upload PDF");
      }
      return response.json();
    },
    onSuccess: async () => {
      setCurrentStep("parsing");
      try {
        const parseResponse = await fetch(`${BACKEND_URL}/user-details/parse-pdf`, {
          method: "GET",
          headers: {
            Authorization: token!,
          },
        });

        if (!parseResponse.ok) {
          throw new Error("Failed to parse PDF");
        }

        const parseData = await parseResponse.json();
        setCurrentStep("extracting");
        const extractResponse = await fetch(`${BACKEND_URL}/openai/resume-text-extraction`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token!,
          },
          body: JSON.stringify({ text: parseData.text }),
        });

        if (!extractResponse.ok) {
          throw new Error("Failed to extract data");
        }

        const extracted = await extractResponse.json();
        const parsedExtracted =
          typeof extracted === "string" ? JSON.parse(extracted) : extracted;

        if (parsedExtracted?.message === "not a resume") {
          try {
            await fetch(`${BACKEND_URL}/upload-pdf`, {
              method: "DELETE",
              headers: {
                Authorization: token!,
              },
            });
          } catch (cleanupError) {
            console.error("Failed to remove invalid resume link:", cleanupError);
          }
          toast.error("The uploaded file does not look like a resume. Please upload one.");
          setCurrentStep("upload");
          return;
        }
        const transformedData: ExtractedData = {
          Name: parsedExtracted.Name || "",
          Experience: parsedExtracted.Experience || "",
          Skills: parsedExtracted.Skills || "",
          Location: parsedExtracted.Location || "",
          LinkedIn: parsedExtracted.LinkedIn || "",
          Portfolio: parsedExtracted.Portfolio || "",
          Github: parsedExtracted.Github || "",
          ExpectedSalary: parsedExtracted.ExpectedSalary || "",
          Availability: parsedExtracted.Availability || "",
        };

        setExtractedData(transformedData);
        setCurrentStep("review");
        options?.onSuccess?.();
      } catch (error) {
        console.error("Error in processing:", error);
        setCurrentStep("upload");
      }
    },
  });

  return {
    currentStep,
    setCurrentStep,
    extractedData,
    setExtractedData,
    uploadMutation,
  };
}

