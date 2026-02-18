"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/scripts/lib/utils";
import { Job } from "./types";
import { useApplication } from "./hooks/useApplication";
import { useUser } from "@/store/user";

interface ApplyDialogProps {
  job: Job;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplyDialog({ job, isOpen, onOpenChange }: ApplyDialogProps) {
  const { jobid } = useParams<{ jobid: string }>();
  const { token } = useUser();
  const [coverLetter, setCoverLetter] = useState("");
  const [notes, setNotes] = useState("");

  const { applyMutation } = useApplication(jobid, token);

  const wordCount = coverLetter.trim().split(/\s+/).filter(Boolean).length;
  const isValid = coverLetter.trim().length > 0 && wordCount <= 500;

  const handleApply = () => {
    if (!isValid) return;
    applyMutation.mutate(
      { coverLetter, notes },
      {
        onSuccess: () => {
          onOpenChange(false);
          setCoverLetter("");
          setNotes("");
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="text-lg px-8">
          Apply Now
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Apply for {job.title}</DialogTitle>
          <DialogDescription>
            Fill in the details below to submit your application.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="coverLetter">Cover Letter *</Label>
              <span className={cn(
                "text-xs",
                wordCount > 500 ? "text-red-500" : "text-muted-foreground"
              )}>
                {wordCount} / 500 words max
              </span>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 p-3 mb-2">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-900 dark:text-blue-100 space-y-1">
                  <p className="font-medium">Cover letter should include:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    <li>Why you're interested in this position</li>
                    <li>Relevant skills and experience</li>
                    <li>What you can bring to the company</li>
                    <li>Maximum 500 words</li>
                  </ul>
                </div>
              </div>
            </div>
            <textarea
              id="coverLetter"
              className={cn(
                "flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                "ring-offset-background placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                !isValid && coverLetter && "border-red-500 focus-visible:ring-red-500"
              )}
              placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my interest in the [position] at [company]...&#10;&#10;With [X years] of experience in [field], I have developed strong skills in...&#10;&#10;I am particularly drawn to this role because...&#10;&#10;Thank you for considering my application."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
            {coverLetter && !isValid && (
              <p className="text-xs text-red-500">
                Cover letter must not exceed 500 words (currently {wordCount})
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <textarea
              id="notes"
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                "ring-offset-background placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              placeholder="Any additional information you'd like to include..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={applyMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={applyMutation.isPending || !isValid}
          >
            {applyMutation.isPending ? "Submitting..." : "Submit Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

