import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/scripts/authOptions";
import { BACKEND_URL } from "@/scripts/lib/config";
import type { Company } from "@/components/companies/types";
import { CompanyDetailsPageClient } from "@/components/companies/CompanyDetailsPageClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type CompanyDetails = Company & {
  companytype: {
    name: string;
    description: string | null;
  };
  isAssociated?: boolean;
};

interface PageProps {
  params: Promise<{
    companyId: string;
  }>;
}

async function getCompanyDetails(
  companyId: string,
  token: string
): Promise<CompanyDetails | null> {
  console.log(companyId,token)
  const response = await fetch(`${BACKEND_URL}/company?companyId=${companyId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
      Authorization: token,
        },
    cache: "no-store",
      });

  const res = await response.json().catch(() => null);

  if (!response.ok) {
    // If company not found, return null so we can show a friendly message
    if (response.status === 404) {
      return null;
    }
    throw new Error(res?.message || "Failed to fetch company details");
  }

      return res as CompanyDetails;
}

export default async function CompanyDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.token) {
    redirect("/login");
  }

  const { companyId } = await params;

  const company = await getCompanyDetails(companyId, session.token);

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Company not found.</p>
        <Button asChild className="mt-4">
          <Link href="/recruiterdashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <CompanyDetailsPageClient companyId={companyId} company={company} />
  );
}
