"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobFormData } from "./types";

interface JobContactInfoProps {
  formData: JobFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function JobContactInfo({ formData, onInputChange }: JobContactInfoProps) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          id="contactEmail"
          name="contactEmail"
          type="email"
          placeholder="talent@yourcompany.com"
          value={formData.contactEmail}
          onChange={onInputChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="applicationurl">Application URL</Label>
        <Input
          id="applicationurl"
          name="applicationurl"
          type="url"
          placeholder="https://..."
          value={formData.applicationurl}
          onChange={onInputChange}
        />
      </div>
    </div>
  );
}

