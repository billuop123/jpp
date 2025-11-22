"use client";
import { BACKEND_URL } from "@/lib/config";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/store/user";
import { useState } from "react";
export default function JobDetailsPage() {
  const { jobid } = useParams<{ jobid: string }>();
  const { token } = useUser();
  const [coverLetter, setCoverLetter] = useState("");
  const [notes, setNotes] = useState("");
  const jobQuery = useQuery({
    queryKey: ["job", jobid],
    enabled: !!jobid,
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/jobs/${jobid}`);
      const res = await response.json();
      if (!response.ok) throw new Error("Failed to fetch job");
      return res;
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${BACKEND_URL}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token!,
        },
        body: JSON.stringify({
          jobId: jobid,
          coverLetter: coverLetter,
          notes: notes,
        }),
      });
      const res = await response.json();
      if (!response.ok) throw new Error("Failed to apply for job");
      return res;
    },
  });
  return (
    <div>
      <h1>Job Details</h1>
      <pre>{JSON.stringify(jobQuery.data ?? {}, undefined, 2)}</pre>
      <Dialog>
        <DialogTrigger>Apply</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for the job</DialogTitle>
            <DialogDescription>
              Please fill in the following details to apply for the job.
              <Input
                type="text"
                placeholder="Cover Letter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button type="submit" onClick={() => applyMutation.mutate()}>
                Apply
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
