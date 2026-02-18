import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Company } from "@/components/companies/types";

interface UnverifiedCompaniesSectionProps {
  page: number;
  limit: number;
  isLoading: boolean;
  error: unknown;
  companies: Company[];
  onPageChange: (page: number) => void;
  onReviewCompany: (company: Company) => void;
  onOpenDocument: (company: Company) => void;
}

export function UnverifiedCompaniesSection({
  page,
  limit,
  isLoading,
  error,
  companies,
  onPageChange,
  onReviewCompany,
  onOpenDocument,
}: UnverifiedCompaniesSectionProps) {
  const hasError = !!error;
  const errorMessage =
    (error as Error | null)?.message ??
    "Something went wrong while fetching companies.";

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">Unverified Companies</h2>
          <p className="text-sm text-muted-foreground">
            These companies are pending verification. Open a company to review
            its incorporation PDF and confirm.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">Page {page}</div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading companies...</p>
      )}

      {hasError && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}

      {!isLoading && !hasError && companies.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No unverified companies at the moment.
        </p>
      )}

      {companies.length > 0 && (
        <Table>
          <TableCaption>
            List of companies waiting for admin verification.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Post Limit</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Incorporation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.email}</TableCell>
                <TableCell>
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary underline underline-offset-2"
                    >
                      {company.website}
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>{company.postlimit}</TableCell>
                <TableCell>
                  {new Date(company.createdAt).toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  {company.incorporationLink ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenDocument(company)}
                    >
                      View document
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Not uploaded
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReviewCompany(company)}
                  >
                    Review &amp; Verify
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page === 1 || isLoading}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={isLoading || companies.length < limit}
        >
          Next
        </Button>
      </div>
    </section>
  );
}


