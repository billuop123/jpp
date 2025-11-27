"use client";

import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { toast } from "sonner";

import { BACKEND_URL } from "@/lib/config";
import { useUser } from "@/store/user";
import { fetchUserDetails } from "@/app/lib/queryfunctions/jobsqueryfunctions";
import UploadStep from "@/components/user-details/UploadStep";
import LoadingStep from "@/components/LoadingStep";
import ReviewStep from "@/components/user-details/ReviewStep";
import SuccessStep from "@/components/user-details/SuccessStep";
import { Button } from "@/components/ui/button";

type Step = "upload" | "parsing" | "extracting" | "review" | "saving" | "success";

interface ExtractedData {
  Name?: string;
  Experience?: number | string;
  Skills?: string;
  Location?: string;
  LinkedIn?: string;
  Portfolio?: string;
  Github?: string;
  ExpectedSalary?: number | string;
  Availability?: string;
}

interface UserDetailsResponse {
  resumeLink?: string | null;
  experience?: number | null;
  location?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  github?: string | null;
  expectedSalary?: number | null;
  availability?: string | null;
  skills?: string[] | null;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export function UserDetailsFlow() {
  const [files, setFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const { token } = useUser();
  const router = useRouter();

  const userDetailsQuery = useQuery<UserDetailsResponse, Error>({
    queryKey: ["user-details-self"],
    enabled: !!token,
    retry: false,
    queryFn: () => fetchUserDetails(token as string),
    // @ts-expect-error onError is available at runtime but missing in our types
    onError: (error: Error) => {
      if (error.message === "Invalid token") {
        toast.error("Invalid token, please sign in again");
        router.replace("/api/auth/signin");
      }
    },
  });

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
      setFiles([]);
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
            userDetailsQuery.refetch();
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
        userDetailsQuery.refetch();
      } catch (error) {
        console.error("Error in processing:", error);
        setCurrentStep("upload");
      }
    },
  });

  const isUserDetailsNotFound =
    userDetailsQuery.isError &&
    (userDetailsQuery.error as Error | undefined)?.message === "User details not found";

  const userDetailsData =
    !userDetailsQuery.isError || isUserDetailsNotFound
      ? (userDetailsQuery.data as UserDetailsResponse | undefined)
      : undefined;

  const hasResume = !!userDetailsData?.resumeLink;

  const mappedUserDetails = useMemo<ExtractedData | null>(() => {
    const data = userDetailsData;
    if (!data) return null;
    return {
      Name: data.user?.name ?? "",
      Experience: data.experience ?? "",
      Skills: data.skills && data.skills.length > 0 ? data.skills.join(", ") : "",
      Location: data.location ?? "",
      LinkedIn: data.linkedin ?? "",
      Portfolio: data.portfolio ?? "",
      Github: data.github ?? "",
      ExpectedSalary: data.expectedSalary ?? "",
      Availability: data.availability ?? "",
    };
  }, [userDetailsData]);

  useEffect(() => {
    if (hasResume && currentStep === "upload" && !uploadMutation.isPending) {
      setExtractedData((prev) => prev ?? mappedUserDetails ?? {});
      setCurrentStep("review");
    }
  }, [hasResume, currentStep, uploadMutation.isPending, mappedUserDetails]);

  const saveMutation = useMutation({
    mutationFn: async (data: ExtractedData) => {
      const skillsArray = data.Skills
        ? data.Skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        experience: data.Experience ? Number(data.Experience) : undefined,
        location: data.Location || undefined,
        linkedin: data.LinkedIn || undefined,
        portfolio: data.Portfolio || undefined,
        github: data.Github || undefined,
        expectedSalary: data.ExpectedSalary ? Number(data.ExpectedSalary) : undefined,
        availability: data.Availability || undefined,
        skills: skillsArray.length > 0 ? skillsArray : undefined,
      };

      const response = await fetch(`${BACKEND_URL}/user-details`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token!,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save user details");
      }
      return response.json();
    },
    onSuccess: () => {
      setCurrentStep("success");
    },
  });

  useEffect(() => {
    if (currentStep === "success") {
      const timer = setTimeout(() => {
        router.push("/jobs");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, router]);

  const handleFileUpload = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
  };

  const handleUpload = () => {
    if (!files.length) return;
    uploadMutation.mutate(files[0]);
  };

  const handleSave = (data: ExtractedData) => {
    setCurrentStep("saving");
    saveMutation.mutate(data);
  };

  if (userDetailsQuery.isLoading && !isUserDetailsNotFound) {
    return (
      <div className="max-w-4xl mx-auto p-6 min-h-[calc(100vh-8rem)] flex flex-col">
        <LoadingStep message="Loading your profile..." />
      </div>
    );
  }

  if (userDetailsQuery.isError && !isUserDetailsNotFound) {
    return (
      <div className="max-w-4xl mx-auto p-6 min-h-[calc(100vh-8rem)] flex flex-col">
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-sm text-red-600 dark:text-red-400">
            {(userDetailsQuery.error as Error)?.message || "Failed to load your profile"}
          </p>
          <Button
            variant="outline"
            onClick={() => userDetailsQuery.refetch()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-[calc(100vh-8rem)] flex flex-col">
      <AnimatePresence mode="wait">
        {currentStep === "upload" && !uploadMutation.isPending && !hasResume && (
          <UploadStep
            key="upload"
            files={files}
            onFileUpload={handleFileUpload}
            onUpload={handleUpload}
            isUploading={uploadMutation.isPending}
          />
        )}

        {uploadMutation.isPending && currentStep === "upload" && (
          <LoadingStep key="uploading" message="Uploading your resume..." />
        )}

        {currentStep === "parsing" && (
          <LoadingStep key="parsing" message="Parsing your resume..." />
        )}

        {currentStep === "extracting" && (
          <LoadingStep key="extracting" message="Extracting information using AI..." />
        )}

        {currentStep === "review" && extractedData && (
          <ReviewStep
            key="review"
            extractedData={extractedData}
            onSave={handleSave}
            isSaving={saveMutation.isPending}
          />
        )}

        {currentStep === "saving" && (
          <LoadingStep key="saving" message="Saving your details..." />
        )}

        {currentStep === "success" && <SuccessStep key="success" />}
      </AnimatePresence>

      {(uploadMutation.isError || saveMutation.isError) && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-sm text-red-600 dark:text-red-400">
            {uploadMutation.error?.message || saveMutation.error?.message || "An error occurred"}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              uploadMutation.reset();
              saveMutation.reset();
              setCurrentStep("upload");
            }}
            className="mt-2"
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

