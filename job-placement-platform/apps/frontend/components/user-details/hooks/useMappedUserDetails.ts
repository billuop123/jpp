import { useMemo } from "react";
import { ExtractedData, UserDetailsResponse } from "../types";

export function useMappedUserDetails(
  userDetailsData: UserDetailsResponse | undefined
): ExtractedData | null {
  return useMemo<ExtractedData | null>(() => {
    const data = userDetailsData;
    if (!data) return null;
    return {
      Name: data.user?.name ?? "",
      Experience: data.experience ?? "",
      Skills: data.skills && data.skills.length > 0 ? data.skills.join(", ") : "",
      Location: data.location ?? "",
      LinkedIn: data.linkedin ?? "",
      Portfolio: data.portfolio ?? "",
      Github: data.github ?? "",
      ExpectedSalary: data.expectedSalary ?? "",
      Availability: data.availability ?? "",
    };
  }, [userDetailsData]);
}

