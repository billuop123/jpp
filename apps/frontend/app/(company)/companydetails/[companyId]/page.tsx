"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import { BACKEND_URL } from "@/scripts/lib/config";
import { useUser } from "@/store/user";
import type { Company } from "@/components/companies/types";
import { CompanyDetailsHeader } from "@/components/companies/CompanyDetailsHeader";
import { CompanyDetailsHero } from "@/components/companies/CompanyDetailsHero";
import { CompanyDetailsInfoSection } from "@/components/companies/CompanyDetailsInfoSection";

type CompanyDetails = Company & {
  companytype: {
    name: string;
    description: string | null;
  };
  isAssociated?: boolean;
};

export default function CompanyDetailsPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const { token } = useUser();
  const router = useRouter();

  const {
    data,
    isLoading,
    error,
  } = useQuery<CompanyDetails, Error>({
    retry: false,
    enabled: !!companyId && !!token,
    queryKey: ["company", companyId],
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/company/${companyId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token!,
        },
      });
      const res = await response.json();
      if (!response.ok)
        throw new Error(res.message || "Failed to fetch company details");
      return res as CompanyDetails;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <CompanyDetailsHeader
          name={data?.name}
          onBack={() => router.back()}
          onGoToJobs={
            companyId ? () => router.push(`/companyjobs/${companyId}`) : undefined
          }
        />

        {isLoading && (
          <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
            Loading company details...
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error.message || "There was a problem fetching this company."}
          </div>
        )}

        {data && !isLoading && !error && (
          <>
            <CompanyDetailsHero
              company={data}
              companytypeName={data.companytype?.name}
              companytypeDescription={data.companytype?.description}
              isAssociated={data.isAssociated}
            />
            <CompanyDetailsInfoSection company={data} />
          </>
        )}
      </div>
    </div>
  );
}