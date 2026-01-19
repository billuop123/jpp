"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobFormData } from "./types";

interface JobDatesAndExperienceProps {
  formData: JobFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function JobDatesAndExperience({ formData, onInputChange }: JobDatesAndExperienceProps) {
  // Prevent selecting past or same-day deadlines.
  // Backend requires deadline > now, so we set min to "tomorrow" in local time.
  const tomorrow = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  return (
    <div className="grid gap-2 md:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="deadline">Application Deadline *</Label>
        <Input
          id="deadline"
          name="deadline"
          type="date"
          min={tomorrow}
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

