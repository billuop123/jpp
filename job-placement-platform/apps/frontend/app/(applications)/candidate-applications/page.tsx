import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/scripts/authOptions";
import { BACKEND_URL } from "@/scripts/lib/config";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface RealInterviewRow {
  id: string;
  createdAt: string;
  relevanceScore: number | null;
  applicationstatus: {
    name: string;
  } | null;
  job: {
    id: string;
    title: string;
    company: {
      name: string | null;
    } | null;
  } | null;
}

interface MockInterviewRow {
  id: string;
  createdAt: string;
  relevanceScore: number | null;
  job: {
    id: string;
    title: string;
    company: {
      name: string | null;
    } | null;
  } | null;
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return dateString;
  }
}

async function getRealInterviews(token: string): Promise<RealInterviewRow[]> {
  const res = await fetch(`${BACKEND_URL}/applications/my-interviews`, {
    headers: {
      Authorization: token,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  return (await res.json()) as RealInterviewRow[];
}

async function getMockInterviews(token: string): Promise<MockInterviewRow[]> {
  const res = await fetch(`${BACKEND_URL}/mock-interviews`, {
    headers: {
      Authorization: token,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  return (await res.json()) as MockInterviewRow[];
}

export default async function CandidateApplicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.token || session.user?.role !== "CANDIDATE") {
    redirect("/");
  }

  const [realInterviews, mockInterviews] = await Promise.all([
    getRealInterviews(session.token),
    getMockInterviews(session.token),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        <header className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Interviews
          </p>
          <h1 className="text-3xl font-semibold">
            Your interview history
          </h1>
          <p className="text-muted-foreground">
            Review results from your real interviews and mock practice sessions.
          </p>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-medium">Real interviews</h2>
            <Badge variant="outline">
              {realInterviews.length} completed
            </Badge>
          </div>

          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {realInterviews.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-muted-foreground"
                    >
                      You don&apos;t have any analyzed interviews yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  realInterviews.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.job?.title ?? "Unknown job"}
                      </TableCell>
                      <TableCell>
                        {row.job?.company?.name ?? "—"}
                      </TableCell>
                      <TableCell>{formatDate(row.createdAt)}</TableCell>
                      <TableCell>
                        {row.relevanceScore != null ? (
                          <span>{row.relevanceScore}</span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {row.applicationstatus?.name ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/interview/analysis/${row.id}`}>
                            View analysis
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableCaption>
                Real interview analysis powered by your live interview
                transcripts.
              </TableCaption>
            </Table>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-medium">Mock interviews</h2>
            <Badge variant="outline">
              {mockInterviews.length} completed
            </Badge>
          </div>

          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInterviews.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground"
                    >
                      You haven&apos;t completed any mock interviews yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  mockInterviews.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.job?.title ?? "Unknown job"}
                      </TableCell>
                      <TableCell>
                        {row.job?.company?.name ?? "—"}
                      </TableCell>
                      <TableCell>{formatDate(row.createdAt)}</TableCell>
                      <TableCell>
                        {row.relevanceScore != null ? (
                          <span>{row.relevanceScore}</span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/mock/analysis/${row.id}`}>
                            View analysis
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableCaption>
                Mock interviews help you practice and get feedback before the
                real thing.
              </TableCaption>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
}