"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BACKEND_URL } from "@/scripts/lib/config";
import { initialFormState, type JobFormData } from "./types";
import { JobBasicInfo } from "./JobBasicInfo";
import { JobSalaryInfo } from "./JobSalaryInfo";
import { JobDatesAndExperience } from "./JobDatesAndExperience";
import { SkillsInput } from "./SkillsInput";
import { JobDetailsSection } from "./JobDetailsSection";
import { JobContactInfo } from "./JobContactInfo";

interface JobTypeApi {
  id: string;
  name: string;
  description?: string | null;
}

interface PostJobDialogProps {
  companyId: string;
  token: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PostJobDialog({
  companyId,
  token,
  isOpen,
  onOpenChange,
  onSuccess,
}: PostJobDialogProps) {
  const [formData, setFormData] = useState<JobFormData>(initialFormState);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const jobTypesQuery = useQuery<JobTypeApi[]>({
    queryKey: ["job-types"],
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/jobs/types`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message || "Failed to load job types");
      }
      return res as JobTypeApi[];
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async () => {
      if (!formData.title.trim()) throw new Error("Job title is required");
      if (!formData.jobtype.trim()) throw new Error("Job type is required");
      if (!formData.deadline) throw new Error("Deadline is required");

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        jobtype: formData.jobtype.trim(),
        location: formData.location.trim() || undefined,
        isRemote: formData.isRemote,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        salaryCurrency: formData.salaryCurrency.trim() || undefined,
        requirements: formData.requirements.trim() || undefined,
        responsibilities: formData.responsibilities.trim() || undefined,
        benefits: formData.benefits.trim() || undefined,
        applicationurl: formData.applicationurl.trim() || undefined,
        contactEmail: formData.contactEmail.trim() || undefined,
        experienceLevel: formData.experienceLevel
          ? Number(formData.experienceLevel)
          : undefined,
        skills,
        isactive: true,
        isfeatured: false,
        deadline: new Date(formData.deadline).toISOString(),
      };

      const res = await fetch(`${BACKEND_URL}/jobs/${companyId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create job");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Job posted successfully");
      setFormData(initialFormState);
      setSkills([]);
      setSkillInput("");
      onOpenChange(false);
      onSuccess();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const target = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: target.type === "checkbox" ? target.checked : value,
    }));
  };


  const handleAddSkill = (skill: string) => {
    setSkills((prev) => [...prev, skill]);
    setSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Post a Job</DialogTitle>
          <DialogDescription>
            Share the essentials, hit publish, and we will handle the rest.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <JobBasicInfo
            formData={formData}
            onInputChange={handleInputChange}
            jobTypeOptions={
              (jobTypesQuery.data || []).map((type) => ({
                id: type.id,
                label: type.name,
                value: type.name,
              })) ?? []
            }
            onJobTypeChange={(value) =>
              setFormData((prev) => ({ ...prev, jobtype: value }))
            }
            jobTypesLoading={jobTypesQuery.isLoading}
            jobTypesError={
              jobTypesQuery.isError ? (jobTypesQuery.error as Error) : null
            }
          />
          <JobSalaryInfo formData={formData} onInputChange={handleInputChange} />
          <JobDatesAndExperience formData={formData} onInputChange={handleInputChange} />
          <SkillsInput
            skills={skills}
            skillInput={skillInput}
            onSkillInputChange={setSkillInput}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
          />
          <JobDetailsSection formData={formData} onInputChange={handleInputChange} />
          <JobContactInfo formData={formData} onInputChange={handleInputChange} />
        </div>
        <DialogFooter className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createJobMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => createJobMutation.mutate()}
            disabled={createJobMutation.isPending}
          >
            {createJobMutation.isPending ? "Posting..." : "Publish Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


