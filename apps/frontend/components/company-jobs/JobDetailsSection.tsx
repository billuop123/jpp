"use client";

import { Label } from "@/components/ui/label";
import { JobFormData } from "./types";

interface JobDetailsSectionProps {
  formData: JobFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const textareaClassName =
  "rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function JobDetailsSection({ formData, onInputChange }: JobDetailsSectionProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="description">Job Description</Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Tell candidates what makes this role exciting..."
          value={formData.description}
          onChange={onInputChange}
          className={textareaClassName}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="requirements">Requirements</Label>
        <textarea
          id="requirements"
          name="requirements"
          rows={3}
          placeholder="Required skills, tools, certifications..."
          value={formData.requirements}
          onChange={onInputChange}
          className={textareaClassName}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="responsibilities">Responsibilities</Label>
        <textarea
          id="responsibilities"
          name="responsibilities"
          rows={3}
          placeholder="Primary goals for this role..."
          value={formData.responsibilities}
          onChange={onInputChange}
          className={textareaClassName}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="benefits">Benefits</Label>
        <textarea
          id="benefits"
          name="benefits"
          rows={3}
          placeholder="PTO, healthcare, equity..."
          value={formData.benefits}
          onChange={onInputChange}
          className={textareaClassName}
        />
      </div>
    </>
  );
}

