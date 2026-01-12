"use client";

import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Candidate {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  role: {
    code: string;
  };
  isPremium: boolean;
}

interface CandidateAdminPageClientProps {
  candidates: Candidate[];
  page: number;
  limit: number;
}

export default function CandidateAdminPageClient({
  candidates,
  page,
  limit,
}: CandidateAdminPageClientProps) {
  const router = useRouter();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    const params = new URLSearchParams();
    params.set("page", String(newPage));
    params.set("limit", String(limit));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Candidates</h1>
        <div className="text-sm text-muted-foreground">Page {page}</div>
      </div>

      {candidates.length === 0 && (
        <p className="text-sm text-muted-foreground">No candidates found.</p>
      )}

      {candidates.length > 0 && (
        <Table>
          <TableCaption>List of all candidate users.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>{candidate.name ?? "-"}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>{candidate.role?.code ?? "-"}</TableCell>
                <TableCell>{candidate.isPremium ? "Yes" : "No"}</TableCell>
                <TableCell>
                  {new Date(candidate.createdAt).toLocaleDateString(
                    undefined,
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          onClick={() => handlePageChange(page + 1)}
          disabled={candidates.length < limit}
        >
          Next
        </button>
      </div>
    </div>
  );
}

