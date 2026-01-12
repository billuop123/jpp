import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/scripts/authOptions";
import { BACKEND_URL } from "@/scripts/lib/config";
import CandidateAdminPageClient from "@/components/admin/CandidateAdminPageClient";

interface Candidate {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
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

export default async function CandidatePage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.token) {
    redirect("/login");
  }

  const page = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 5;

  const response = await fetch(
    `${BACKEND_URL}/admin/candidates?page=${page}&limit=${limit}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: session.token,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch candidates");
  }

  const candidates = (await response.json()) as Candidate[];

  return (
    <CandidateAdminPageClient candidates={candidates} page={page} limit={limit} />
  );
}
