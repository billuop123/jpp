import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/scripts/authOptions";
import { BACKEND_URL } from "@/scripts/lib/config";
import RecruiterAdminPageClient from "@/components/admin/RecruiterAdminPageClient";

interface Recruiter {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  company?: {
    name: string;
  }[];
  role: {
    code: string;
  };
  isPremium: boolean;
}

interface PageProps {
  searchParams?: {
    page?: string;
    limit?: string;
  };
}

export default async function RecruiterAdminPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.token) {
    redirect("/login");
  }

  const page = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 2;

      const response = await fetch(
        `${BACKEND_URL}/admin/recruiters?page=${page}&limit=${limit}`,
        {
          headers: {
        "Content-Type": "application/json",
        Authorization: session.token,
          },
      cache: "no-store",
    }
  );

      if (!response.ok) {
    throw new Error("Failed to fetch recruiters");
      }

  const recruiters = (await response.json()) as Recruiter[];

  return (
    <RecruiterAdminPageClient
      recruiters={recruiters}
      page={page}
      limit={limit}
    />
  );
}
