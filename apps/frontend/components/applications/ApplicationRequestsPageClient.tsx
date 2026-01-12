"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
                  <TableHead>Application ID</TableHead>
                  <TableHead>Candidate ID</TableHead>
                  <TableHead>Requested at</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const shortApplicationId = request.id.slice(0, 8);
                  const shortUserId = request.userId.slice(0, 8);

                  return (
                    <TableRow
                      key={request.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        router.push(
                          `/user-profile/${request.userId}/${request.id}`
                        )
                      }
                    >
                      <TableCell className="font-mono text-xs">
                        {shortApplicationId}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {shortUserId}
                      </TableCell>
                      <TableCell>
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(request);
                          }}
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Updating..." : "Grant access"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

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

