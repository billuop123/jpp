"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { BACKEND_URL } from "@/scripts/lib/config";
import { authOptions } from "@/scripts/authOptions";
import type { Company } from "@/components/companies/types";
import { RecruiterDashboardClient } from "@/components/dashboard/RecruiterDashboardClient";

async function getMyCompanies(token: string): Promise<Company[]> {
      const response = await fetch(`${BACKEND_URL}/company/my-companies`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
      Authorization: token,
        },
    cache: "no-store",
      });
      const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message || "Failed to get my companies");
  }
      return res as Company[];
}

export default async function RecruiterDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.token || session.user?.role !== "RECRUITER") {
    redirect("/");
  }

  const companies = await getMyCompanies(session.token);

  return <RecruiterDashboardClient companies={companies} />;
}
