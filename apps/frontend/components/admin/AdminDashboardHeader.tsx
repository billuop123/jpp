import Link from "next/link";

import { Button } from "@/components/ui/button";

type AdminDashboardHeaderProps = {
  onClearJobs: () => void;
  onSyncJobs: () => void;
  isClearing?: boolean;
  isSyncing?: boolean;
};

export function AdminDashboardHeader({
  onClearJobs,
  onSyncJobs,
  isClearing,
  isSyncing,
}: AdminDashboardHeaderProps) {
  return (
    <header className="space-y-3">
      <p className="text-sm text-muted-foreground uppercase tracking-wide">
        Admin
      </p>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Button asChild variant="outline" size="sm">
            <Link href="/candidateadmin">Candidate Admin</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/recruiteradmin">Recruiter Admin</Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onClearJobs}
            disabled={isClearing || isSyncing}
          >
            {isClearing ? "Clearing jobs..." : "Clear jobs (both DBs)"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSyncJobs}
            disabled={isSyncing || isClearing}
          >
            {isSyncing ? "Syncing..." : "Sync DBs"}
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground max-w-2xl text-sm">
        Review and verify companies before they can start posting jobs. Use the
        incorporation document to confirm legitimacy. You can also clear and
        re-sync all jobs between the main database and Qdrant.
      </p>
    </header>
  );
}

