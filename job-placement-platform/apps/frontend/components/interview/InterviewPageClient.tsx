"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import LoadingStep from "@/components/LoadingStep";
import { Button } from "@/components/ui/button";
import { InterviewHeader } from "@/components/interview/InterviewHeader";
import { InterviewControls } from "@/components/interview/InterviewControls";
import { useInterview } from "@/components/interview/useInterview";
import { BACKEND_URL } from "@/scripts/lib/config";
import type { ApplicationData } from "@/components/interview/types";

interface InterviewPageClientProps {
  applicationId: string;
  token: string | null;
  initialApplication: ApplicationData | null;
  clientKey: string | null;
}

export default function InterviewPageClient({
  applicationId,
  token,
  initialApplication,
  clientKey,
}: InterviewPageClientProps) {
  const router = useRouter();

  // If user is not authenticated, show sign-in message
  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground mb-4">
          Please sign in to start the interview.
        </p>
      </div>
    );
  }

  // If we failed to load either the application or the client key on the server
  if (!initialApplication || !clientKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
          <p className="text-destructive/80 mb-4">
            Failed to initialize interview session. Please try again.
          </p>
          <Button onClick={() => router.refresh()} variant="destructive">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const assistantQuery = useQuery({
    queryKey: ["vapi-assistant", applicationId],
    retry: false,
    enabled: !!token && !!applicationId && !!clientKey,
    queryFn: async () => {
      const response = await fetch(
        `${BACKEND_URL}/vapi/call-assistant/${applicationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token!,
          },
          body: JSON.stringify({}),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to create interview assistant"
        );
      }
      return response.json() as Promise<{ assistantId: string }>;
    },
  });

  const interview = useInterview({
    applicationId,
    apiKey: clientKey,
    assistantId: assistantQuery.data?.assistantId || "",
    token: token || "",
  });

  const isLoading = assistantQuery.isLoading;
  const error = assistantQuery.error as Error | null;

  useEffect(() => {
    if (assistantQuery.isError && error) {
      // Optionally, could show a toast here
      console.error("Assistant creation failed:", error.message);
    }
  }, [assistantQuery.isError, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <LoadingStep message="Initializing interview session..." />
      </div>
    );
  }

  if (interview.isConnecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <LoadingStep message="Connecting to interview session..." />
      </div>
    );
  }

  if (interview.isSubmitting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <LoadingStep message="Submitting interview and analyzing responses..." />
      </div>
    );
  }

  if (!initialApplication.job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
          <p className="text-destructive/80">Job information not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        <InterviewHeader job={initialApplication.job} />

        <InterviewControls
          isConnected={interview.isConnected}
          isSpeaking={interview.isSpeaking}
          timeRemaining={interview.timeRemaining}
          onStart={interview.startCall}
          onEnd={interview.endInterview}
          disabled={!assistantQuery.data?.assistantId || !clientKey}
        />
      </div>
    </div>
  );
}

