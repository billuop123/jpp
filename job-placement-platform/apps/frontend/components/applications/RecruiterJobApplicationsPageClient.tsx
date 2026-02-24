"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ScoringListData } from "@/components/interview/types";
import { BACKEND_URL } from "@/scripts/lib/config";

interface RecruiterJobApplicationsPageClientProps {
  jobId: string;
  applications: ScoringListData[];
  token: string;
  jobTitle: string;
}

export default function RecruiterJobApplicationsPageClient({
  jobId,
  applications,
  token,
  jobTitle,
}: RecruiterJobApplicationsPageClientProps) {
  const router = useRouter();
  const [selectedApplication, setSelectedApplication] = useState<{ app: ScoringListData; status: 'approved' | 'rejected' } | null>(null);
  const [emailMessage, setEmailMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const getDefaultMessage = (status: 'approved' | 'rejected', candidateName: string) => {
    if (status === 'approved') {
      return `Dear ${candidateName},\n\nWe are pleased to inform you that your application for the position of ${jobTitle} has been approved. Our team will contact you shortly with the next steps.\n\nBest regards,\nThe Recruitment Team`;
    } else {
      return `Dear ${candidateName},\n\nThank you for your interest in the position of ${jobTitle}. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.\n\nWe appreciate the time you invested in the application process and wish you the best in your job search.\n\nBest regards,\nThe Recruitment Team`;
    }
  };

  const handleOpenDialog = (app: ScoringListData, status: 'approved' | 'rejected') => {
    setSelectedApplication({ app, status });
    setEmailMessage(getDefaultMessage(status, app.user?.name || 'Candidate'));
  };

  const handleSendEmail = async () => {
    if (!selectedApplication) return;

    try {
      setIsSending(true);
      const response = await fetch(`${BACKEND_URL}/email/send-application-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          to: selectedApplication.app.user?.email,
          candidateName: selectedApplication.app.user?.name,
          status: selectedApplication.status,
          jobTitle,
          customMessage: emailMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast.success(`${selectedApplication.status === 'approved' ? 'Approval' : 'Rejection'} email sent successfully`);
      setSelectedApplication(null);
      setEmailMessage('');
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Applications
          </p>
          <h1 className="text-3xl font-semibold">
            Recruiter Applications
          </h1>
          <p className="text-muted-foreground">
            View scored candidates for this job and open detailed application
            insights.
          </p>
        </header>

        {applications.length === 0 && (
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            No applications have been scored for this job yet.
          </div>
        )}

        {applications.length > 0 && (
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Relevance Score</TableHead>
                  <TableHead className="w-[300px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application, index) => {
                  const shortId = application.id
                    ? String(application.id).slice(0, 8)
                    : "—";

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {application.user?.name || "Unnamed candidate"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ID: {shortId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {application.user?.email ?? "—"}
                      </TableCell>
                      <TableCell>
                        <span className="text-base font-semibold">
                          {application.relevanceScore ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(
                                `/recruiter-applications/${jobId}/${application.user?.id}`
                              )
                            }
                            disabled={!application.user?.id}
                          >
                            View details
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleOpenDialog(application, 'approved')}
                            disabled={!application.user?.email}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleOpenDialog(application, 'rejected')}
                            disabled={!application.user?.email}
                          >
                            <X className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog
          open={!!selectedApplication}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedApplication(null);
              setEmailMessage('');
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedApplication?.status === 'approved' ? 'Send Approval Email' : 'Send Rejection Email'}
              </DialogTitle>
              <DialogDescription>
                Sending to <span className="font-medium">{selectedApplication?.app.user?.email}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email-message">Email Message</Label>
                <Textarea
                  id="email-message"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={10}
                  className="resize-none"
                  placeholder="Enter your email message..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedApplication(null);
                  setEmailMessage('');
                }}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={isSending || !emailMessage.trim()}
                variant={selectedApplication?.status === 'approved' ? 'default' : 'destructive'}
              >
                {isSending ? 'Sending...' : 'Send Email'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

