"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BACKEND_URL } from "@/lib/config";

const initialFormState = {
  title: "",
  description: "",
  jobtype: "",
  location: "",
  isRemote: false,
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "USD",
  requirements: "",
  responsibilities: "",
  benefits: "",
  applicationurl: "",
  contactEmail: "",
  experienceLevel: "",
  deadline: "",
};

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
  const [formData, setFormData] = useState(initialFormState);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSkillKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const value = skillInput.trim();
      if (!value || skills.includes(value)) return;
      setSkills((prev) => [...prev, value]);
      setSkillInput("");
    }
  };

  const removeSkill = (value: string) => {
    setSkills((prev) => prev.filter((skill) => skill !== value));
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
          <div className="grid gap-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Senior Frontend Engineer"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="jobtype">Job Type *</Label>
            <Input
              id="jobtype"
              name="jobtype"
              placeholder="Full-time"
              value={formData.jobtype}
              onChange={handleInputChange}
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
                onChange={handleInputChange}
              />
            </div>
            <label className="mt-6 flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                name="isRemote"
                checked={formData.isRemote}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-muted-foreground text-primary focus:ring-primary"
              />
              Remote friendly role
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="salaryMin">Salary Min</Label>
              <Input
                id="salaryMin"
                name="salaryMin"
                type="number"
                placeholder="60000"
                value={formData.salaryMin}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salaryCurrency">Currency</Label>
              <Input
                id="salaryCurrency"
                name="salaryCurrency"
                placeholder="USD"
                value={formData.salaryCurrency}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="deadline">Application Deadline *</Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="skills">Skills (press enter to add)</Label>
            <Input
              id="skills"
              name="skills"
              placeholder="React"
              value={skillInput}
              onChange={(event) => setSkillInput(event.target.value)}
              onKeyDown={handleSkillKeyDown}
            />
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/80"
                  >
                    {skill} ✕
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Job Description</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Tell candidates what makes this role exciting..."
              value={formData.description}
              onChange={handleInputChange}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              onChange={handleInputChange}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              onChange={handleInputChange}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              onChange={handleInputChange}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                placeholder="talent@yourcompany.com"
                value={formData.contactEmail}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
              />
            </div>
          </div>
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


