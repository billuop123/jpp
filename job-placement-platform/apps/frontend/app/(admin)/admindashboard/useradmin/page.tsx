import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/scripts/authOptions";
import { BACKEND_URL } from "@/scripts/lib/config";
import UserAdminPageClient from "@/components/admin/UserAdminPageClient";

interface UserAdminRow {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  role: {
    code: string | null;
  } | null;
  isPremium: boolean;
}

interface PageProps {
  searchParams?: {
    page?: string;
    limit?: string;
  };
}

export default async function UserAdminPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.token || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  const page = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 10;

  const response = await fetch(
    `${BACKEND_URL}/admin/users?page=${page}&limit=${limit}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: session.token,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const users = (await response.json()) as UserAdminRow[];

  return (
    <UserAdminPageClient
      users={users}
      page={page}
      limit={limit}
      token={session.token}
    />
  );
}

