"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";

import { useUser } from "@/store/user";
import { useUserDetails } from "./hooks/useUserDetails";
import { useResumeUpload } from "./hooks/useResumeUpload";
import { useSaveUserDetails } from "./hooks/useSaveUserDetails";
import { useMappedUserDetails } from "./hooks/useMappedUserDetails";
import UploadStep from "./UploadStep";
import LoadingStep from "@/components/LoadingStep";
import ReviewStep from "./ReviewStep";
import SuccessStep from "./SuccessStep";
import { ErrorDisplay } from "./ErrorDisplay";
import { Step, ExtractedData } from "./types";

export function UserDetailsFlowClient() {
  const [files, setFiles] = useState<File[]>([]);
  const { token } = useUser();
  const router = useRouter();

  const { userDetailsQuery, userDetailsData, hasResume, isUserDetailsNotFound } =
    useUserDetails(token);

  const mappedUserDetails = useMappedUserDetails(userDetailsData);

  const {
    currentStep,
    setCurrentStep,
    extractedData,
    setExtractedData,
    uploadMutation,
  } = useResumeUpload(token, {
    onSuccess: () => {
      userDetailsQuery.refetch();
    },
  });

  const { saveMutation } = useSaveUserDetails(token, setCurrentStep);

  useEffect(() => {
    if (hasResume && currentStep === "upload" && !uploadMutation.isPending) {
      setExtractedData((prev) => prev ?? mappedUserDetails ?? {});
      setCurrentStep("review");
    }
  }, [hasResume, currentStep, uploadMutation.isPending, mappedUserDetails, setExtractedData, setCurrentStep]);

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
    setFiles([]);
  };

  const handleSave = (data: ExtractedData) => {
    setCurrentStep("saving");
    saveMutation.mutate(data);
  };

  const handleRetry = () => {
    uploadMutation.reset();
    saveMutation.reset();
    setCurrentStep("upload");
  };

  if (userDetailsQuery.isLoading && !isUserDetailsNotFound) {
    return <LoadingStep message="Loading your profile..." />;
  }

  if (userDetailsQuery.isError && !isUserDetailsNotFound) {
    return (
      <ErrorDisplay
        message={
          (userDetailsQuery.error as Error)?.message || "Failed to load your profile"
        }
        onRetry={() => userDetailsQuery.refetch()}
      />
    );
  }

  return (
    <>
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
        <ErrorDisplay
          message={
            uploadMutation.error?.message ||
            saveMutation.error?.message ||
            "An error occurred"
          }
          onRetry={handleRetry}
        />
      )}
    </>
  );
}


