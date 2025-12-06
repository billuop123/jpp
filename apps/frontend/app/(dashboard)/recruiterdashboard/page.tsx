"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { BACKEND_URL } from "@/scripts/lib/config";
import { useUser } from "@/store/user";
import { CreateCompanyDialog } from "@/components/companies/CreateCompanyDialog";
import { Company } from "@/components/companies/types";

export default function RecruiterDashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { token } = useUser();
  const router = useRouter();
  
  const getMyCompany = useQuery({
    queryKey: ['my-companies'],
    retry: false,
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/company/my-companies`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token!,
        },
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || "Failed to get my companies");
      return res as Company[];
    },
    enabled: !!token,
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your companies and job postings
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} size="lg">
            Create Company
          </Button>
        </div>
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">My Companies</h2>
            {getMyCompany.data && getMyCompany.data.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {getMyCompany.data.length}{" "}
                {getMyCompany.data.length === 1 ? "company" : "companies"}
              </span>
            )}
          </div>

          {getMyCompany.isLoading && (
            <div className="flex min-h-[160px] items-center justify-center text-muted-foreground">
              Loading companies...
            </div>
          )}

          {getMyCompany.isError && !getMyCompany.isLoading && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {(getMyCompany.error as Error | null)?.message ??
                "Failed to load companies"}
            </div>
          )}

          {getMyCompany.data && getMyCompany.data.length === 0 && !getMyCompany.isLoading && (
            <div className="rounded-xl border bg-background/60 px-6 py-8 text-center">
              <p className="text-lg font-medium text-muted-foreground">
                No companies yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first company to start posting jobs.
              </p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                Create Company
              </Button>
            </div>
          )}

          {getMyCompany.data && getMyCompany.data.length > 0 && (
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Post limit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[180px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getMyCompany.data.map((company: Company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={company.name}
                              className="h-8 w-8 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted text-xs font-semibold">
                              {company.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium">{company.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {company.email}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {company.website ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2"
                          >
                            {company.website}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{company.postlimit}</TableCell>
                      <TableCell>
                        {company.blacklisted ? (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                            Blacklisted
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/companydetails/${company.id}`)}
                          >
                            Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => router.push(`/companyjobs/${company.id}`)}
                          >
                            Post jobs
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>

      <CreateCompanyDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => getMyCompany.refetch()}
      />
    </div>
  );
}