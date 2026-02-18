"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
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

  const handleApply = () => {
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
            <Label htmlFor="coverLetter">Cover Letter</Label>
            <textarea
              id="coverLetter"
              className={cn(
                "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                "ring-offset-background placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              placeholder="Write your cover letter here..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
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
            disabled={applyMutation.isPending || !coverLetter.trim()}
          >
            {applyMutation.isPending ? "Submitting..." : "Submit Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

