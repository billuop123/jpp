"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompanyTypeDropdown } from "@/components/ui/company-type-dropdown";
import { BACKEND_URL } from "@/scripts/lib/config";
import { useUser } from "@/store/user";
import { toast } from "sonner";
import type { Company } from "@/components/companies/types";

interface CompanyTypeApi {
  id: string;
  name: string;
  description?: string | null;
}

interface CreateCompanyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (company: Company) => void;
}

export function CreateCompanyDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateCompanyDialogProps) {
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [companyType, setCompanyType] = useState<string>("");
  const [incorporationFile, setIncorporationFile] = useState<File | null>(null);
  const { token } = useUser();

  const companyTypesQuery = useQuery<CompanyTypeApi[]>({
    queryKey: ["company-types"],
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/company/types`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token!,
        },
      });
      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message || "Failed to load company types");
      }
      return res as CompanyTypeApi[];
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${BACKEND_URL}/company`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token!,
        },
        body: JSON.stringify({
          name: companyName,
          email: companyEmail,
          website: companyWebsite || undefined,
          logo: companyLogo || undefined,
          companyType: companyType,
        }),
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || "Failed to create company");

      // If an incorporation PDF was selected, upload it after company is created
      if (incorporationFile) {
        const formData = new FormData();
        formData.append("file", incorporationFile);

        const uploadResponse = await fetch(
          `${BACKEND_URL}/company/upload-incorporation-pdf/${res.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: token!,
              // NOTE: let the browser set the multipart boundary
            } as HeadersInit,
            body: formData,
          },
        );

        if (!uploadResponse.ok) {
          const uploadRes = await uploadResponse.json().catch(() => ({}));
          throw new Error(
            uploadRes.message || "Company created, but failed to upload incorporation PDF",
          );
        }
      }

      return res as Company;
    },
    onSuccess: (createdCompany: Company) => {
      toast.success("Company created successfully!");
      onOpenChange(false);
      // Reset form
      setCompanyName("");
      setCompanyEmail("");
      setCompanyWebsite("");
      setCompanyLogo("");
      setCompanyType("");
      setIncorporationFile(null);
      onSuccess?.(createdCompany);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create company");
    },
  });

  const handleSubmit = () => {
    if (!companyName || !companyEmail || !companyType) {
      toast.error("Please fill in all required fields");
      return;
    }
    createCompanyMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Company</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new company.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Enter company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyType">Company Type *</Label>
            <CompanyTypeDropdown
              options={
                (companyTypesQuery.data || []).map((type) => ({
                  id: type.id,
                  label: type.name,
                  value: type.name,
                })) ?? []
              }
              value={companyType}
              onValueChange={setCompanyType}
              placeholder={
                companyTypesQuery.isLoading
                  ? "Loading company types..."
                  : "Select company type"
              }
            />
            {companyTypesQuery.isError && (
              <p className="text-xs text-destructive">
                {(companyTypesQuery.error as Error | null)?.message ??
                  "Failed to load company types"}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyEmail">Company Email *</Label>
            <Input
              id="companyEmail"
              type="email"
              placeholder="Enter company email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyWebsite">Company Website</Label>
            <Input
              id="companyWebsite"
              type="url"
              placeholder="Enter company website"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyLogo">Company Logo</Label>
            <Input
              id="companyLogo"
              type="text"
              placeholder="Enter company logo link"
              value={companyLogo}
              onChange={(e) => setCompanyLogo(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="incorporationPdf">
              Incorporation Document (PDF)
            </Label>
            <Input
              id="incorporationPdf"
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setIncorporationFile(file);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Optional: Attach a PDF proving your company incorporation. You can
              also add it later from the company details page.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createCompanyMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              createCompanyMutation.isPending ||
              !companyName ||
              !companyEmail ||
              !companyType
            }
          >
            {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

