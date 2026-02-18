"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobFormData } from "./types";
import { CompanyTypeDropdown } from "@/components/ui/company-type-dropdown";

interface JobTypeOption {
  id: string;
  label: string;
  value: string;
}

interface JobBasicInfoProps {
  formData: JobFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  jobTypeOptions: JobTypeOption[];
  onJobTypeChange: (value: string) => void;
  jobTypesLoading?: boolean;
  jobTypesError?: Error | null;
}

export function JobBasicInfo({
  formData,
  onInputChange,
  jobTypeOptions,
  onJobTypeChange,
  jobTypesLoading,
  jobTypesError,
}: JobBasicInfoProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="title">Job Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="Senior Frontend Engineer"
          value={formData.title}
          onChange={onInputChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="jobtype">Job Type *</Label>
        <CompanyTypeDropdown
          options={jobTypeOptions}
          value={formData.jobtype}
          onValueChange={onJobTypeChange}
          placeholder={jobTypesLoading ? "Loading job types..." : "Select job type"}
        />
        {jobTypesError && (
          <p className="text-xs text-destructive">
            {jobTypesError.message || "Failed to load job types"}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="Remote, San Francisco..."
            value={formData.location}
            onChange={onInputChange}
          />
        </div>
        <label className="mt-6 flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            name="isRemote"
            checked={formData.isRemote}
            onChange={onInputChange}
            className="h-4 w-4 rounded border-muted-foreground text-primary focus:ring-primary"
          />
          Remote friendly role
        </label>
      </div>
    </>
  );
}

