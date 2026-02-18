"use client";

import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { Company } from "./types";
import { CompanyCard } from "./CompanyCard";

interface CompaniesListProps {
  companies: Company[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onCreateCompanyClick: () => void;
}

export function CompaniesList({
  companies,
  isLoading,
  isError,
  error,
  onCreateCompanyClick,
}: CompaniesListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">My Companies</h2>
        {companies && companies.length > 0 && (
          <span className="text-muted-foreground">
            {companies.length} {companies.length === 1 ? 'company' : 'companies'}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading companies...</p>
        </div>
      )}

      {isError && (
        <div className="text-center py-12">
          <p className="text-destructive">
            {error instanceof Error 
              ? error.message 
              : "Failed to load companies"}
          </p>
        </div>
      )}

      {companies && companies.length === 0 && (
        <div className="text-center py-12 rounded-xl border bg-background/50 backdrop-blur-sm">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg mb-2">No companies yet</p>
          <p className="text-muted-foreground mb-4">Create your first company to get started</p>
          <Button onClick={onCreateCompanyClick}>Create Company</Button>
        </div>
      )}

      {companies && companies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </div>
  );
}

