import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/scripts/authOptions";
import { BACKEND_URL } from "@/scripts/lib/config";
import type { Company } from "@/components/companies/types";
import { CompanyDetailsPageClient } from "@/components/companies/CompanyDetailsPageClient";

type CompanyDetails = Company & {
  companytype: {
    name: string;
    description: string | null;
  };
  isAssociated?: boolean;
};

interface PageProps {
  params: {
    companyId: string;
  };
}

async function getCompanyDetails(
  companyId: string,
  token: string
): Promise<CompanyDetails> {
  const response = await fetch(`${BACKEND_URL}/company/${companyId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    cache: "no-store",
  });
  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to fetch company details");
  }
  return res as CompanyDetails;
}

export default async function CompanyDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.token) {
    redirect("/login");
  }

  const { companyId } = params;

  const company = await getCompanyDetails(companyId, session.token);

  return (
    <CompanyDetailsPageClient companyId={companyId} company={company} />
  );
}
