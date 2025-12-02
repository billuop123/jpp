"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobFormData } from "./types";

interface JobBasicInfoProps {
  formData: JobFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function JobBasicInfo({ formData, onInputChange }: JobBasicInfoProps) {
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
        <Input
          id="jobtype"
          name="jobtype"
          placeholder="Full-time"
          value={formData.jobtype}
          onChange={onInputChange}
        />
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

