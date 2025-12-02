import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchUserDetails } from "@/app/lib/queryfunctions/jobsqueryfunctions";
import { UserDetailsResponse } from "../types";

export function useUserDetails(token: string | null) {
  const router = useRouter();

  const userDetailsQuery = useQuery<UserDetailsResponse, Error>({
    queryKey: ["user-details-self"],
    enabled: !!token,
    retry: false,
    queryFn: () => fetchUserDetails(token as string),
    // @ts-expect-error onError is available at runtime but missing in our types
    onError: (error: Error) => {
      if (error.message === "Invalid token") {
        toast.error("Invalid token, please sign in again");
        router.replace("/api/auth/signin");
      }
    },
  });

  const isUserDetailsNotFound =
    userDetailsQuery.isError &&
    (userDetailsQuery.error as Error | undefined)?.message === "User details not found";

  const userDetailsData =
    !userDetailsQuery.isError || isUserDetailsNotFound
      ? (userDetailsQuery.data as UserDetailsResponse | undefined)
      : undefined;

  const hasResume = !!userDetailsData?.resumeLink;

  return {
    userDetailsQuery,
    userDetailsData,
    hasResume,
    isUserDetailsNotFound,
  };
}

