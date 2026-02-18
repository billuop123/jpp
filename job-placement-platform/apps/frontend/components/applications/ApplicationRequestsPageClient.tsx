"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText } from "lucide-react";

import { BACKEND_URL } from "@/scripts/lib/config";
import { Button } from "@/components/ui/button";
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

export type PendingApplication = {
  id: string;
  jobId: string;
  userId: string;
  applicationstatusId: string;
  createdAt: string;
  coverletter?: string;
  notes?: string;
  user: {
    name: string;
    email: string;
  };
};

interface ApplicationRequestsPageClientProps {
  jobId: string;
  token: string;
  initialRequests: PendingApplication[];
}

export default function ApplicationRequestsPageClient({
  jobId,
  token,
  initialRequests,
}: ApplicationRequestsPageClientProps) {
  const router = useRouter();
  const [requests, setRequests] = useState<PendingApplication[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] =
    useState<PendingApplication | null>(null);
  const [viewingApplication, setViewingApplication] =
    useState<PendingApplication | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleGrantAccess = async (applicationId: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch(
        `${BACKEND_URL}/jobs/update-request-status/${applicationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update request status");
      }

      toast.success("Request granted successfully");
      setRequests((prev) =>
        prev.filter((request) => request.id !== applicationId)
      );
      setSelectedRequest(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update request status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Application Requests
          </p>
          <h1 className="text-3xl font-semibold">
            Pending access requests for job {jobId}
          </h1>
          <p className="text-muted-foreground">
            Review incoming application access requests for this job and grant
            access when you&apos;re ready.
          </p>
        </header>

        {requests.length === 0 && (
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            There are currently no pending application requests for this job.
          </div>
        )}

        {requests.length > 0 && (
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Requested at</TableHead>
                  <TableHead className="w-[200px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.user.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {request.user.email}
                    </TableCell>
                    <TableCell>
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingApplication(request)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                          disabled={isUpdating}
                        >
                          Grant access
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog
          open={!!viewingApplication}
          onOpenChange={(open) => {
            if (!open) setViewingApplication(null);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                {viewingApplication?.user.name} • {viewingApplication?.user.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {viewingApplication?.coverletter ? (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Cover Letter
                  </h3>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm whitespace-pre-line">
                      {viewingApplication.coverletter}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No cover letter provided</p>
              )}

              {viewingApplication?.notes && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Additional Notes
                  </h3>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm whitespace-pre-line">
                      {viewingApplication.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingApplication(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setViewingApplication(null);
                  setSelectedRequest(viewingApplication);
                }}
              >
                Grant Access
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!selectedRequest}
          onOpenChange={(open) => {
            if (!open) setSelectedRequest(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grant access to application?</DialogTitle>
              <DialogDescription>
                This will mark the selected application request as{" "}
                <span className="font-medium">GRANTED</span>. Are you sure you
                want to continue?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedRequest(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!selectedRequest) return;
                  void handleGrantAccess(selectedRequest.id);
                }}
                disabled={isUpdating}
              >
                {isUpdating ? "Granting..." : "Confirm grant"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

