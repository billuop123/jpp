"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ScoringListData } from "@/components/interview/types";

interface RecruiterJobApplicationsPageClientProps {
  jobId: string;
  applications: ScoringListData[];
}

export default function RecruiterJobApplicationsPageClient({
  jobId,
  applications,
}: RecruiterJobApplicationsPageClientProps) {
  const router = useRouter();

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
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
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

