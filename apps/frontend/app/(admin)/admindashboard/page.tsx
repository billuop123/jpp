import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/scripts/authOptions";
import { BACKEND_URL } from "@/scripts/lib/config";
import type { Company } from "@/components/companies/types";
import AdminDashboardPageClient from "@/components/admin/AdminDashboardPageClient";

interface PageProps {
  searchParams?: {
    page?: string;
    limit?: string;
  };
}

export default async function AdminDashboard({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.token) {
    redirect("/login");
  }

  const page = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 5;

      const response = await fetch(
        `${BACKEND_URL}/admin/unverified-companies?page=${page}&limit=${limit}`,
        {
          headers: {
        "Content-Type": "application/json",
        Authorization: session.token,
      },
      cache: "no-store",
    }
  );

      if (!response.ok) {
    throw new Error("Failed to fetch unverified companies");
  }

  const companies = (await response.json()) as Company[];

  return (
    <AdminDashboardPageClient
      companies={companies}
          page={page}
          limit={limit}
      token={session.token}
      />
  );
}
