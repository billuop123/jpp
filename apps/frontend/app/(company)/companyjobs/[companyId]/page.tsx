import { getServerSession } from "next-auth";

import { authOptions } from "@/scripts/authOptions";
import { CompanyJobsClient } from "./CompanyJobsClient";
import { BACKEND_URL } from "@/scripts/lib/config";
import { redirect } from "next/navigation";
export default async function CompanyJobsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const [{ companyId }, session] = await Promise.all([
    params,
    getServerSession(authOptions),
  ]);

  if (!session?.token || !session.user?.id || session.user.role !== "RECRUITER") {
    redirect("/");
  }
  try {
    const res = await fetch(
      `${BACKEND_URL}/company/is-recruiter/${companyId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: session.token,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      redirect("/");
    }

    const data = await res.json();
    if (!data?.status) {
      redirect("/");
    }
  } catch {
    redirect("/");
  }

  return (
    <CompanyJobsClient
      companyId={companyId}
      token={session?.token}
      userId={session?.user?.id}
    />
  );
}

