import { UserDetailsFlowClient } from "./UserDetailsFlowClient";
import type { UserDetailsResponse } from "./types";

interface UserDetailsFlowProps {
  initialUserDetails: UserDetailsResponse | null;
}

export function UserDetailsFlow({ initialUserDetails }: UserDetailsFlowProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Complete your profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload your resume and confirm your details so we can match you to the best jobs.
        </p>
      </div>
      <UserDetailsFlowClient initialUserDetails={initialUserDetails} />
    </div>
  );
}
