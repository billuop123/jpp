"use client";

import { Button } from "@/components/ui/button";
import type { Company } from "./types";

interface CompanyDetailsInfoSectionProps {
  company: Company;
  onOpenPdf?: (url: string) => void;
}

export function CompanyDetailsInfoSection({
  company,
  onOpenPdf,
}: CompanyDetailsInfoSectionProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <InfoTile label="Email">
        {company.email || <span className="text-muted-foreground">—</span>}
      </InfoTile>
      <InfoTile label="Website">
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
          <span className="text-muted-foreground">—</span>
        )}
      </InfoTile>
      <InfoTile label="Post limit">
        <span className="font-semibold">{company.postlimit}</span>
      </InfoTile>
      <InfoTile label="Incorporation document">
        {company.incorporationLink ? (
          onOpenPdf ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenPdf(company.incorporationLink!)}
            >
              View PDF
            </Button>
          ) : (
            <a
              href={company.incorporationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              View PDF
            </a>
          )
        ) : (
          <span className="text-muted-foreground">Not uploaded</span>
        )}
      </InfoTile>
    </section>
  );
}

function InfoTile({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card/40 px-4 py-3 space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}



