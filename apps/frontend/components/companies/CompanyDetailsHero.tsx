"use client";

import type { Company } from "./types";

type CompanyDetailsHeroProps = {
  company: Company;
  companytypeName?: string;
  companytypeDescription?: string | null;
  isAssociated?: boolean;
};

export function CompanyDetailsHero({
  company,
  companytypeName,
  companytypeDescription,
  isAssociated,
}: CompanyDetailsHeroProps) {
  return (
    <section className="flex flex-wrap items-start gap-6 rounded-xl bg-card/60 px-6 py-5 ring-1 ring-border">
      {company.logo ? (
        <img
          src={company.logo}
          alt={company.name}
          className="h-20 w-20 rounded-xl object-cover border"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-xl border bg-muted text-2xl font-semibold">
          {company.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-semibold">{company.name}</h2>
          {company.blacklisted && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              Blacklisted
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
          <span>{companytypeName}</span>
          {companytypeDescription && (
            <span className="text-muted-foreground/80">
              · {companytypeDescription}
            </span>
          )}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span
            className={`rounded-full px-2 py-0.5 font-medium ${
              isAssociated
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isAssociated
              ? "You are associated with this company"
              : "You are not associated with this company"}
          </span>
        </div>
      </div>
    </section>
  );
}



