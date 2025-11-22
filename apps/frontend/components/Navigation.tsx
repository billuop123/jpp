"use client"
import { useUser } from "@/store/user";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function Navigation() {
  const { username } = useUser();
  const router=useRouter()
  return (
    <div>
      <h1>Navigation</h1>
      <div>{username ? <p>Welcome, {username}</p> : <p>Welcome</p>}</div>
      <div className="flex gap-4 flex-col">
        <Link href="/api/auth/signin">Sign In</Link>
        <button onClick={() => signOut()}>Sign Out</button>
        <button onClick={() => router.push('/jobs')}>Browse jobs</button>
      </div>
    </div>
  );
}