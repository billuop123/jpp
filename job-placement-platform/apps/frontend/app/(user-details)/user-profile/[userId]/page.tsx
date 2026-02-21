import { getServerSession } from "next-auth";
import { authOptions } from "@/scripts/authOptions";
import { redirect } from "next/navigation";
import { BACKEND_URL } from "@/scripts/lib/config";
import UserProfileClient from "./UserProfileClient";

interface PageProps {
  params: {
    userId: string;
  };
}

async function getUserProfile(userId: string, token: string) {
  const res = await fetch(`${BACKEND_URL}/applications/user-details/${userId}`, {
    headers: { Authorization: token },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return await res.json();
}

export default async function UserProfilePage({ params }: PageProps) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.token) {
    redirect("/login");
  }

  const profile = await getUserProfile(userId, session.token);

  if (!profile) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">User not found</h1>
        </div>
      </div>
    );
  }

  return <UserProfileClient profile={profile} />;
}

