import { getServerSession } from "next-auth";
import { authOptions } from "@/scripts/authOptions";
import { redirect } from "next/navigation";
import { CandidateDashboardClient } from "@/components/dashboard/CandidateDashboardClient";
import { BACKEND_URL } from "@/scripts/lib/config";

async function getMyApplications(token: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/applications/my-applications`, {
      headers: { Authorization: token },
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
  if (!session?.token || session.user?.role !== "CANDIDATE") redirect("/login");

  const applications = await getMyApplications(session.token);

  return <CandidateDashboardClient applications={applications} />;
}