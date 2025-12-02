"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobFormData } from "./types";

interface JobDatesAndExperienceProps {
  formData: JobFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function JobDatesAndExperience({ formData, onInputChange }: JobDatesAndExperienceProps) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="deadline">Application Deadline *</Label>
        <Input
          id="deadline"
          name="deadline"
          type="date"
          value={formData.deadline}
          onChange={onInputChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="experienceLevel">Experience (years)</Label>
        <Input
          id="experienceLevel"
          name="experienceLevel"
          type="number"
          placeholder="3"
          value={formData.experienceLevel}
          onChange={onInputChange}
        />
      </div>
    </div>
  );
}

