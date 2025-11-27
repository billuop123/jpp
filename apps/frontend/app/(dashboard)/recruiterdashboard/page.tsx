"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BACKEND_URL } from "@/lib/config";
import { useUser } from "@/store/user";
import { CreateCompanyDialog } from "@/components/companies/CreateCompanyDialog";
import { CompaniesList } from "@/components/companies/CompaniesList";
import { Company } from "@/components/companies/types";

export default function RecruiterDashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { token } = useUser();
  
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

        <CompaniesList
          companies={getMyCompany.data}
          isLoading={getMyCompany.isLoading}
          isError={getMyCompany.isError}
          error={getMyCompany.error as Error | null}
          onCreateCompanyClick={() => setIsDialogOpen(true)}
        />
      </div>

      <CreateCompanyDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => getMyCompany.refetch()}
      />
    </div>
  );
}