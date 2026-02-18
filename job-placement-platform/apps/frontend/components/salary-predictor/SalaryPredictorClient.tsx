"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SALARY_API_URL } from "@/scripts/lib/config";
import { cn } from "@/scripts/lib/utils";

const textareaClassName =
  "min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const WORK_TYPES = ["Full-Time", "Part-Time", "Contract", "Temporary", "Intern"] as const;

const QUALIFICATIONS = [
  "B.Tech",
  "MCA",
  "B.Com",
  "BCA",
  "BA",
  "M.Com",
  "PhD",
  "MBA",
  "M.Tech",
  "BBA",
] as const;

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export interface SalaryPredictionRequest {
  experience: number;
  qualification: string;
  work_type: string;
  job_title: string;
  role: string;
  job_description: string;
  skills: string;
  responsibilities: string;
}

const initialForm: SalaryPredictionRequest = {
  experience: 0,
  qualification: "",
  work_type: "",
  job_title: "",
  role: "",
  job_description: "",
  skills: "",
  responsibilities: "",
};

export default function SalaryPredictorClient() {
  const [form, setForm] = useState<SalaryPredictionRequest>(initialForm);
  const [predictedSalary, setPredictedSalary] = useState<number | null>(null);

  const predictMutation = useMutation({
    mutationFn: async (data: SalaryPredictionRequest) => {
      const res = await fetch(`${SALARY_API_URL}/predictsalary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail ?? "Prediction failed");
      }
      return res.json() as Promise<{ predicted_salary: number }>;
    },
    onSuccess: (data) => {
      setPredictedSalary(data.predicted_salary);
      toast.success("Salary predicted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.qualification?.trim() ||
      !form.work_type?.trim() ||
      !form.job_title?.trim() ||
      !form.role?.trim()
    ) {
      toast.error("Please fill in qualification, work type, job title, and role.");
      return;
    }
    predictMutation.mutate(form);
  };

  const update = (field: keyof SalaryPredictionRequest, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Salary Predictor</h1>
        <p className="text-muted-foreground">
          Enter job details to get an estimated salary prediction from our model.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Job & experience</CardTitle>
            <CardDescription>Basic role and experience information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="experience">Years of experience</Label>
              <Input
                id="experience"
                type="number"
                min={0}
                step={0.5}
                placeholder="e.g. 3"
                value={form.experience || ""}
                onChange={(e) => update("experience", e.target.value ? Number(e.target.value) : 0)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="qualification">Qualification</Label>
              <select
                id="qualification"
                value={form.qualification}
                onChange={(e) => update("qualification", e.target.value)}
                className={selectClassName}
                required
              >
                <option value="">Select qualification</option>
                {QUALIFICATIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="work_type">Work type</Label>
              <select
                id="work_type"
                value={form.work_type}
                onChange={(e) => update("work_type", e.target.value)}
                className={selectClassName}
                required
              >
                <option value="">Select work type</option>
                {WORK_TYPES.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="job_title">Job title</Label>
              <Input
                id="job_title"
                placeholder="e.g. Software Engineer"
                value={form.job_title}
                onChange={(e) => update("job_title", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                placeholder="e.g. Backend Developer"
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description & skills</CardTitle>
            <CardDescription>Job description, skills, and responsibilities (used for prediction)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="job_description">Job description</Label>
              <textarea
                id="job_description"
                rows={3}
                placeholder="Brief description of the role..."
                value={form.job_description}
                onChange={(e) => update("job_description", e.target.value)}
                className={textareaClassName}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skills">Skills</Label>
              <textarea
                id="skills"
                rows={2}
                placeholder="e.g. Python, SQL, React"
                value={form.skills}
                onChange={(e) => update("skills", e.target.value)}
                className={textareaClassName}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <textarea
                id="responsibilities"
                rows={3}
                placeholder="Key responsibilities..."
                value={form.responsibilities}
                onChange={(e) => update("responsibilities", e.target.value)}
                className={textareaClassName}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={predictMutation.isPending}
        >
          {predictMutation.isPending ? "Predicting…" : "Predict salary"}
        </Button>
      </form>

      {predictedSalary != null && (
        <Card className={cn("border-primary/50 bg-primary/5")}>
          <CardHeader>
            <CardTitle>Predicted salary</CardTitle>
            <CardDescription>Estimated salary from the model (same currency as training data)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">
              {new Intl.NumberFormat("en-US", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(predictedSalary)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
