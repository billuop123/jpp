"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobFormData } from "./types";

interface JobSalaryInfoProps {
  formData: JobFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function JobSalaryInfo({ formData, onInputChange }: JobSalaryInfoProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="grid gap-2">
        <Label htmlFor="salaryMin">Salary Min</Label>
        <Input
          id="salaryMin"
          name="salaryMin"
          type="number"
          placeholder="60000"
          value={formData.salaryMin}
          onChange={onInputChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="salaryMax">Salary Max</Label>
        <Input
          id="salaryMax"
          name="salaryMax"
          type="number"
          placeholder="120000"
          value={formData.salaryMax}
          onChange={onInputChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="salaryCurrency">Currency</Label>
        <Input
          id="salaryCurrency"
          name="salaryCurrency"
          placeholder="USD"
          value={formData.salaryCurrency}
          onChange={onInputChange}
        />
      </div>
    </div>
  );
}

