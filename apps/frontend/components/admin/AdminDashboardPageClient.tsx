"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { BACKEND_URL } from "@/scripts/lib/config";
import type { Company } from "@/components/companies/types";
import { AdminDashboardHeader } from "@/components/admin/AdminDashboardHeader";
import { UnverifiedCompaniesSection } from "@/components/admin/UnverifiedCompaniesSection";
import { CompanyVerificationDialog } from "@/components/admin/CompanyVerificationDialog";

interface AdminDashboardPageClientProps {
  companies: Company[];
  page: number;
  limit: number;
  token: string;
}

export default function AdminDashboardPageClient({
  companies,
  page,
  limit,
  token,
}: AdminDashboardPageClientProps) {
  const [currentCompanies, setCurrentCompanies] = useState<Company[]>(companies);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const router = useRouter();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    const params = new URLSearchParams();
    params.set("page", String(newPage));
    params.set("limit", String(limit));
    router.push(`?${params.toString()}`);
  };

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

  const verifyCompany = async (companyId: string) => {
    try {
      setIsVerifying(true);
      const response = await fetch(
        `${BACKEND_URL}/admin/verify-company/${companyId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      const res = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(res.message || "Failed to verify company");
      }

      toast.success("Company verified successfully");
      setCurrentCompanies((prev) =>
        prev.filter((company) => company.id !== companyId)
      );
      setIsDialogOpen(false);
      setSelectedCompany(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to verify company");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOpenCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (isVerifying) return;
    setIsDialogOpen(false);
    setSelectedCompany(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <AdminDashboardHeader />

        <UnverifiedCompaniesSection
          page={page}
          limit={limit}
          isLoading={false}
          error={null}
          companies={currentCompanies}
          onPageChange={handlePageChange}
          onReviewCompany={handleOpenCompany}
          onOpenDocument={(company) => {
            if (company.incorporationLink) {
              openPdfInBrowser(company.incorporationLink);
            }
          }}
        />
      </div>

      <CompanyVerificationDialog
        isOpen={isDialogOpen}
        company={selectedCompany}
        isVerifying={isVerifying}
        onClose={handleCloseDialog}
        onVerify={() => {
          if (selectedCompany) {
            void verifyCompany(selectedCompany.id);
          }
        }}
        onOpenPdf={openPdfInBrowser}
      />
    </div>
  );
}

