import { getServerSession } from "next-auth";
import { authOptions } from "@/scripts/authOptions";
import { redirect } from "next/navigation";
import { CandidateDashboardClient } from "@/components/dashboard/CandidateDashboardClient";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getMyApplications(userId: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/applications/my-interviews`, {
      headers: { "x-user-id": userId },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function CandidateDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const applications = await getMyApplications(session.user.id);

  return <CandidateDashboardClient applications={applications} />;
}