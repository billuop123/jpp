"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { BACKEND_URL } from "@/scripts/lib/config";
import { useUser } from "@/store/user";
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

type PendingApplication = {
  id: string;
  jobId: string;
  userId: string;
  applicationstatusId: string;
  createdAt: string;
};

export default function ApplicationRequestsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { token } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] =
    useState<PendingApplication | null>(null);

  const pendingRequestsQuery = useQuery<PendingApplication[]>({
    queryKey: ["pending-application-requests", jobId],
    enabled: !!jobId && !!token,
    retry: false,
    queryFn: async () => {
      const response = await fetch(
        `${BACKEND_URL}/jobs/pending-requests/${jobId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token!,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch application requests");
      }
      return data as PendingApplication[];
    },
  });

  const updateRequestStatusMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const response = await fetch(
        `${BACKEND_URL}/jobs/update-request-status/${applicationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token!,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update request status");
      }
      return data as { status: boolean };
    },
    onSuccess: async () => {
      toast.success("Request granted successfully");
      setSelectedRequest(null);
      await queryClient.invalidateQueries({
        queryKey: ["pending-application-requests", jobId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update request status");
    },
  });

  const requests = pendingRequestsQuery.data ?? [];

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

        {pendingRequestsQuery.isLoading && (
          <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
            Loading application requests...
          </div>
        )}

        {pendingRequestsQuery.isError && !pendingRequestsQuery.isLoading && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {(pendingRequestsQuery.error as Error | null)?.message ??
              "There was a problem loading application requests. Please try again."}
          </div>
        )}

        {pendingRequestsQuery.isSuccess && requests.length === 0 && (
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
                  <TableHead className="w-[140px] text-right">
                    Actions
                  </TableHead>
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
                          disabled={updateRequestStatusMutation.isPending}
                        >
                          {updateRequestStatusMutation.isPending
                            ? "Updating..."
                            : "Grant access"}
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
                disabled={updateRequestStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!selectedRequest) return;
                  updateRequestStatusMutation.mutate(selectedRequest.id);
                }}
                disabled={updateRequestStatusMutation.isPending}
              >
                {updateRequestStatusMutation.isPending
                  ? "Granting..."
                  : "Confirm grant"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}