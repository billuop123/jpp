import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Company } from "@/components/companies/types";

interface CompanyVerificationDialogProps {
  isOpen: boolean;
  company: Company | null;
  isVerifying: boolean;
  onClose: () => void;
  onVerify: () => void;
  onOpenPdf: (url: string) => void;
}

export function CompanyVerificationDialog({
  isOpen,
  company,
  isVerifying,
onClose,
  onVerify,
  onOpenPdf,
}: CompanyVerificationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {company?.name ?? "Company details"}
          </DialogTitle>
          <DialogDescription>
            Review the company information and incorporation PDF before
            confirming verification.
          </DialogDescription>
        </DialogHeader>

        {company && (
          <div className="space-y-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border bg-card/40 px-4 py-3 space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <p className="text-sm break-all">{company.email}</p>
              </div>
              <div className="rounded-xl border bg-card/40 px-4 py-3 space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Website
                </p>
                <p className="text-sm break-all">
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      {company.website}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </p>
              </div>
              <div className="rounded-xl border bg-card/40 px-4 py-3 space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Post limit
                </p>
                <p className="text-sm font-semibold">{company.postlimit}</p>
              </div>
            </div>

            <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
              <header className="space-y-2">
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  Incorporation document
                </p>
                <h2 className="text-xl font-semibold">{company.name}</h2>
                <p className="text-muted-foreground text-sm">
                  The incorporation PDF will open in a new browser tab. Make
                  sure details look legitimate before verifying.
                </p>
              </header>

              {company.incorporationLink ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenPdf(company.incorporationLink!)}
                >
                  Open incorporation PDF in browser
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No incorporation PDF uploaded for this company.
                </p>
              )}
            </section>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isVerifying}
          >
            Cancel
          </Button>
          <Button
            onClick={onVerify}
            disabled={
              !company || isVerifying || !company.incorporationLink
            }
          >
            {isVerifying ? "Verifying..." : "Verify company"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


