"use client";

import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SALARY_API_URL } from "@/scripts/lib/config";
import { cn } from "@/scripts/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const textareaClassName =
  "min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const WORK_TYPES = ["Full-Time", "Part-Time", "Contract", "Temporary", "Intern"] as const;

const QUALIFICATIONS = [
  "BCA/CSIT/BIT",
  "B.Tech/BE",
  "BBA/BBS",
  "B.Com",
  "BA",
  "MCA/MIT",
  "M.Tech/ME",
  "MBA",
  "M.Com",
  "PhD",
] as const;

const ROLES = [
  "Mobile App Developer", "Network Performance Analyst", "System Administrator", "QA Manager",
  "Network Administrator", "Database Administrator", "Data Engineer", "UI/UX Front-End Developer",
  "Cloud Systems Engineer", "NoSQL Database Engineer", "E-commerce Web Designer", "IT Analyst",
  "Network Security Specialist", "Quality Assurance Analyst", "UX/UI Designer", "IT Director",
  "Infrastructure Manager", "Front-End Developer", "Network Support Specialist", "Business Systems Analyst",
  "Frontend Web Designer", "SQL Database Developer", "Systems Integration Specialist", "JavaScript Developer",
  "Machine Learning Engineer", "Interaction Designer", "IT Support Specialist", "Business Intelligence Analyst",
  "Data Scientist", "Backend Developer", "Frontend Developer", "Java Web Application Developer",
  "Usability Analyst", "Data Architect", "Enterprise Architect", "UI/UX Developer",
  "Desktop Support Technician", "Frontend Web Developer", "Big Data Engineer", "IT Systems Administrator",
  "Accessibility Developer", "Database Security Specialist", "Database Developer", "Cybersecurity Analyst",
  "Automation Test Engineer", "Java Software Engineer", "Security Consultant", "Performance Testing Specialist",
  "Full-Stack Developer", "Software QA Tester", "UX Strategist", "Security Operations Center (SOC) Analyst",
  "Database Analyst", "Backend Web Developer", "Cloud Architect", "Solution Architect",
  "Automation Tester", "User Researcher", "Web Designer", "Help Desk Support Specialist",
  "Java Backend Developer", "ETL Developer", "User Experience Designer", "User Interface Designer",
  "DevOps Engineer", "Data Quality Analyst", "Performance Tester", "Network Security Engineer",
  "Wireless Network Engineer"
] as const;

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export interface SalaryPredictionRequest {
  experience: number;
  qualification: string;
  work_type: string;
  job_title: string;
  role: string;
}

const initialForm: SalaryPredictionRequest = {
  experience: 0,
  qualification: "",
  work_type: "",
  job_title: "",
  role: "",
};

export default function SalaryPredictorClient() {
  const [form, setForm] = useState<SalaryPredictionRequest>(initialForm);
  const [predictedSalary, setPredictedSalary] = useState<number | null>(null);
  const [salaryRange, setSalaryRange] = useState<{ lower: number; upper: number } | null>(null);
  const [jobTitleOpen, setJobTitleOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  const { data: jobTitlesData } = useQuery({
    queryKey: ["job-titles"],
    queryFn: async () => {
      const res = await fetch(`${SALARY_API_URL}/job-titles`);
      return res.json() as Promise<{ job_titles: string[] }>;
    },
  });

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
      return res.json() as Promise<{ predicted_salary: number; lower_range: number; upper_range: number }>;
    },
    onSuccess: (data) => {
      setPredictedSalary(data.predicted_salary);
      setSalaryRange({ lower: data.lower_range, upper: data.upper_range });
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
      toast.error("Please fill in all required fields.");
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
              <Popover open={jobTitleOpen} onOpenChange={setJobTitleOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={jobTitleOpen}
                    className="w-full justify-between font-normal"
                  >
                    {form.job_title || "Select job title"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search job title..." />
                    <CommandList>
                      <CommandEmpty>No job title found.</CommandEmpty>
                      <CommandGroup>
                        {jobTitlesData?.job_titles.map((title) => (
                          <CommandItem
                            key={title}
                            value={title}
                            onSelect={() => {
                              update("job_title", title);
                              setJobTitleOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                form.job_title === title ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {title}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Popover open={roleOpen} onOpenChange={setRoleOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={roleOpen}
                    className="w-full justify-between font-normal"
                  >
                    {form.role || "Select role"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search role..." />
                    <CommandList>
                      <CommandEmpty>No role found.</CommandEmpty>
                      <CommandGroup>
                        {ROLES.map((role) => (
                          <CommandItem
                            key={role}
                            value={role}
                            onSelect={() => {
                              update("role", role);
                              setRoleOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                form.role === role ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {role}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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

      {predictedSalary != null && salaryRange && (
        <Card className={cn("border-primary/50 bg-primary/5")}>
          <CardHeader>
            <CardTitle>Predicted salary</CardTitle>
            <CardDescription>Estimated salary from the model (same currency as training data)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Average</p>
              <p className="text-3xl font-bold tabular-nums">
                ${new Intl.NumberFormat("en-US", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(predictedSalary)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Lower Range</p>
                <p className="text-xl font-semibold tabular-nums">
                  ${new Intl.NumberFormat("en-US", {
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(salaryRange.lower)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Upper Range</p>
                <p className="text-xl font-semibold tabular-nums">
                  ${new Intl.NumberFormat("en-US", {
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(salaryRange.upper)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
