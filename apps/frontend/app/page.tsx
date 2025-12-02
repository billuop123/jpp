import { getServerSession } from "next-auth";

import HomePage from "../components/home/HomePage";
import { authOptions } from "@/scripts/authOptions";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return <HomePage session={session} />;
}
