import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/scripts/authOptions";
import { BACKEND_URL } from "@/scripts/lib/config";
import CandidateUserProfilePageClient, {
  UserDetailsResponse,
} from "@/components/applications/CandidateUserProfilePageClient";

interface PageProps {
  params: {
    applicationId: string;
    userId: string;
  };
}

async function getUserDetails(
  userId: string,
  token: string
): Promise<UserDetailsResponse> {
  const response = await fetch(
    `${BACKEND_URL}/applications/user-details/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch user details");
  }
  return data as UserDetailsResponse;
}

export default async function CandidateUserProfilePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.token) {
    redirect("/login");
  }

  const { applicationId, userId } = params;

  const userDetails = await getUserDetails(userId, session.token);

  return (
    <CandidateUserProfilePageClient
      applicationId={applicationId}
      userId={userId}
      userDetails={userDetails}
    />
  );
}
