"use client";

import { useRouter } from "next/navigation";
import { Building2, Mail, Globe, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Company } from "./types";

interface CompanyCardProps {
  company: Company;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export function CompanyCard({ company }: CompanyCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/companydetails/${company.id}`)}
      className="group rounded-xl border bg-background/50 backdrop-blur-sm p-6 space-y-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-foreground/20 hover:bg-background"
    >
      {/* Company Logo and Name */}
      <div className="flex items-start gap-4">
        {company.logo ? (
          <img
            src={company.logo}
            alt={company.name}
            className="w-16 h-16 rounded-lg object-cover border"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold truncate group-hover:text-primary transition-colors">
            {company.name}
          </h3>
          {company.blacklisted && (
            <span className="inline-block mt-1 text-xs px-2 py-1 rounded bg-destructive/10 text-destructive">
              Blacklisted
            </span>
          )}
        </div>
      </div>

      {/* Company Details */}
      <div className="space-y-3">
        {company.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="truncate">{company.email}</span>
          </div>
        )}
        {company.website && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="w-4 h-4" />
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="truncate hover:text-foreground transition-colors"
            >
              {company.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Created {formatDate(company.createdAt)}</span>
        </div>
      </div>

      {/* Post Limit */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Post Limit</span>
          <span className="font-semibold">{company.postlimit}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 flex gap-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/companyjobs/${company.id}`);
          }}
          className="flex-1"
          size="sm"
        >
          Post Jobs
        </Button>
      </div>

      {/* Click Indicator */}
      <div className="pt-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        Click to view details →
      </div>
    </div>
  );
}

