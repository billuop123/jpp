"use client";

import { ScoringListData } from "@/components/interview/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BACKEND_URL } from "@/scripts/lib/config";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

export default function RecruiterApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();

  const applicationQuery = useQuery<ScoringListData[]>({
    queryKey: ["scoring-list", jobId],
    retry: false,
    queryFn: async () => {
      const response = await fetch(
        `${BACKEND_URL}/applications/scoring-list/${jobId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      const data = (await response.json()) as ScoringListData[];
      return data;
    },
  });

  const applications = applicationQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Applications
          </p>
          <h1 className="text-3xl font-semibold">
            Recruiter Applications for Job {jobId}
          </h1>
          <p className="text-muted-foreground">
            View scored candidates for this job and open detailed application
            insights.
          </p>
        </header>

        {applicationQuery.isLoading && (
          <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
            Loading applications...
          </div>
        )}

        {applicationQuery.isError && !applicationQuery.isLoading && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            There was a problem loading applications. Please try again.
          </div>
        )}

        {applicationQuery.isSuccess && applications.length === 0 && (
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
                  <TableHead className="w-[140px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => {
                  const shortId = application.id
                    ? String(application.id).slice(0, 8)
                    : "—";

                  return (
                    <TableRow key={application.id ?? shortId}>
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}