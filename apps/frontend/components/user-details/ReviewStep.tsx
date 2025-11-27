"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "../ui/button";
import { CompanyTypeDropdown } from "../ui/company-type-dropdown";

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

interface ReviewStepProps {
  extractedData: ExtractedData;
  onSave: (data: ExtractedData) => void;
  isSaving: boolean;
}

const availabilityOptions = [
  { id: "immediate", label: "Immediate", value: "Immediate" },
  { id: "one-week", label: "Within 1 week", value: "Within 1 week" },
  { id: "two-weeks", label: "Within 2 weeks", value: "Within 2 weeks" },
  { id: "one-month", label: "Within 1 month", value: "Within 1 month" },
  { id: "three-months", label: "Within 3 months", value: "Within 3 months" },
  { id: "negotiable", label: "Negotiable", value: "Negotiable" },
];

export default function ReviewStep({
  extractedData,
  onSave,
  isSaving,
}: ReviewStepProps) {
  const [formData, setFormData] = useState<ExtractedData>(extractedData);

  const handleChange = (field: keyof ExtractedData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Review Your Information</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please review and edit the extracted information before saving.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.Name || ""}
            onChange={(e) => handleChange("Name", e.target.value)}
            className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Experience (years)</label>
          <input
            type="number"
            value={formData.Experience || ""}
            onChange={(e) =>
              handleChange("Experience", e.target.value ? Number(e.target.value) : "")
            }
            className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            value={formData.Location || ""}
            onChange={(e) => handleChange("Location", e.target.value)}
            className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Expected Salary</label>
          <input
            type="number"
            value={formData.ExpectedSalary || ""}
            onChange={(e) =>
              handleChange("ExpectedSalary", e.target.value ? Number(e.target.value) : "")
            }
            className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Availability</label>
          <CompanyTypeDropdown
            options={availabilityOptions}
            value={formData.Availability || ""}
            onValueChange={(value) => handleChange("Availability", value)}
            placeholder="Select availability"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
          <input
            type="text"
            value={formData.Skills || ""}
            onChange={(e) => handleChange("Skills", e.target.value)}
            className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            placeholder="e.g., JavaScript, React, Node.js"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
          <input
            type="url"
            value={formData.LinkedIn || ""}
            onChange={(e) => handleChange("LinkedIn", e.target.value)}
            className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Portfolio URL</label>
          <input
            type="url"
            value={formData.Portfolio || ""}
            onChange={(e) => handleChange("Portfolio", e.target.value)}
            className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">GitHub URL</label>
          <input
            type="url"
            value={formData.Github || ""}
            onChange={(e) => handleChange("Github", e.target.value)}
            className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          variant="default"
        >
          {isSaving ? "Saving…" : "Save Details"}
        </Button>
      </div>
    </motion.div>
  );
}

