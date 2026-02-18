"use client";

import { useRouter } from "next/navigation";

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

interface CompanyDetailsPageClientProps {
  companyId: string;
  company: CompanyDetails;
}

export function CompanyDetailsPageClient({
  companyId,
  company,
}: CompanyDetailsPageClientProps) {
  const router = useRouter();

  const openPdfInBrowser = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const pdfUrl = URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <CompanyDetailsHeader
          name={company.name}
          onBack={() => router.back()}
          onGoToJobs={() => router.push(`/companyjobs/${companyId}`)}
        />

        <CompanyDetailsHero
          company={company}
          companytypeName={company.companytype?.name}
          companytypeDescription={company.companytype?.description}
          isAssociated={company.isAssociated}
        />
        <CompanyDetailsInfoSection
          company={company}
          onOpenPdf={openPdfInBrowser}
        />
      </div>
    </div>
  );
}

