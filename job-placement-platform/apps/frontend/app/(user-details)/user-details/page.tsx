import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { UserDetailsFlow } from "@/components/user-details/UserDetailsFlow";
import { authOptions } from "@/scripts/authOptions";
import { BACKEND_URL } from "@/scripts/lib/config";
import type { UserDetailsResponse } from "@/components/user-details/types";

async function getUserDetails(
  token: string
): Promise<UserDetailsResponse | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/user-details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      cache: "no-store",
    });

    const res = await response.json();

    if (res.message === "Invalid token") {
      return null;
    }

    if (!response.ok) {
      if (res.message === "User details not found") {
        return null;
      }
      throw new Error(res.message || "Failed to fetch user details");
    }

    return res as UserDetailsResponse;
  } catch {
    return null;
  }
}

export default async function UserDetailsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.token) {
    redirect("/login");
  }

  const initialUserDetails = await getUserDetails(session.token);

  return <UserDetailsFlow initialUserDetails={initialUserDetails} />;
}
