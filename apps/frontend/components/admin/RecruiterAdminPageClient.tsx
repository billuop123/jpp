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

interface Recruiter {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  company?: {
    name: string;
  }[];
  role: {
    code: string;
  };
  isPremium: boolean;
}

interface RecruiterAdminPageClientProps {
  recruiters: Recruiter[];
  page: number;
  limit: number;
}

export default function RecruiterAdminPageClient({
  recruiters,
  page,
  limit,
}: RecruiterAdminPageClientProps) {
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
        <h1 className="text-2xl font-semibold">Recruiters</h1>
        <div className="text-sm text-muted-foreground">Page {page}</div>
      </div>

      {recruiters.length === 0 && (
        <p className="text-sm text-muted-foreground">No recruiters found.</p>
      )}

      {recruiters.length > 0 && (
        <Table>
          <TableCaption>List of all recruiter users.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recruiters.map((recruiter) => (
              <TableRow key={recruiter.id}>
                <TableCell>{recruiter.name ?? "-"}</TableCell>
                <TableCell>{recruiter.email}</TableCell>
                <TableCell>
                  {recruiter.company && recruiter.company.length > 0
                    ? recruiter.company[0]?.name
                    : "-"}
                </TableCell>
                <TableCell>{recruiter.role?.code ?? "-"}</TableCell>
                <TableCell>{recruiter.isPremium ? "Yes" : "No"}</TableCell>
                <TableCell>
                  {new Date(recruiter.createdAt).toLocaleDateString(
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
          disabled={recruiters.length < limit}
        >
          Next
        </button>
      </div>
    </div>
  );
}

