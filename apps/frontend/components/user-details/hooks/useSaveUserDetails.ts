import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/scripts/lib/config";
import { ExtractedData, Step } from "../types";

export function useSaveUserDetails(token: string | null, setCurrentStep: (step: Step) => void) {
  const router = useRouter();

  const saveMutation = useMutation({
    mutationFn: async (data: ExtractedData) => {
      const skillsArray = data.Skills
        ? data.Skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        experience: data.Experience ? Number(data.Experience) : undefined,
        location: data.Location || undefined,
        linkedin: data.LinkedIn || undefined,
        portfolio: data.Portfolio || undefined,
        github: data.Github || undefined,
        expectedSalary: data.ExpectedSalary ? Number(data.ExpectedSalary) : undefined,
        availability: data.Availability || undefined,
        skills: skillsArray.length > 0 ? skillsArray : undefined,
      };

      const response = await fetch(`${BACKEND_URL}/user-details`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token!,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save user details");
      }
      return response.json();
    },
    onSuccess: () => {
      setCurrentStep("success");
    },
  });

  return { saveMutation };
}

