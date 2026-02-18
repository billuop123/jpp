"use client";

import { FileUpload } from "@/components/ui/file-upload";
import { motion } from "motion/react";
import { Button } from "../ui/button";

interface UploadStepProps {
  files: File[];
  onFileUpload: (files: File[]) => void;
  onUpload: () => void;
  isUploading: boolean;
}

export default function UploadStep({
  files,
  onFileUpload,
  onUpload,
  isUploading,
}: UploadStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold">Upload Your Resume</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Please upload your resume in PDF format to get started.
      </p>
      <FileUpload onChange={onFileUpload} />
      <Button
        variant="default"
        onClick={onUpload}
        disabled={!files.length || isUploading}
        className="w-fit"
      >
        {isUploading ? "Uploading…" : "Upload Resume"}
      </Button>
    </motion.div>
  );
}

