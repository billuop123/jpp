"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import LoadingStep from "@/components/LoadingStep";
import { Button } from "@/components/ui/button";
import { InterviewHeader } from "@/components/interview/InterviewHeader";
import { InterviewControls } from "@/components/interview/InterviewControls";
import { useMockInterview } from "@/components/interview/useMockInterview";
import { BACKEND_URL } from "@/scripts/lib/config";
import type { Job } from "@/components/jobs/types";

interface MockInterviewPageClientProps {
  jobId: string;
  mockInterviewId: string;
  token: string | null;
  clientKey: string | null;
  initialJob: Job | null;
}

export default function MockInterviewPageClient({
  jobId,
  mockInterviewId,
  token,
  clientKey,
  initialJob,
}: MockInterviewPageClientProps) {
  const router = useRouter();

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground mb-4">
          Please sign in to start a mock interview.
        </p>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    );
  }

  if (!clientKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
          <p className="text-destructive/80 mb-4">
            Failed to initialize mock interview session. Please try again.
          </p>
          <Button onClick={() => router.refresh()} variant="destructive">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const assistantQuery = useQuery({
    queryKey: ["mock-vapi-assistant", jobId, mockInterviewId],
    retry: false,
    enabled: !!token && !!jobId && !!clientKey,
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/vapi/call-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token!,
        },
        body: JSON.stringify({ assistant: null, jobId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to create mock interview assistant"
        );
      }
      return response.json() as Promise<{ assistantId: string }>;
    },
  });

  const mockInterview = useMockInterview({
    mockInterviewId,
    apiKey: clientKey,
    assistantId: assistantQuery.data?.assistantId || "",
    token: token || "",
  });

  const isLoading = assistantQuery.isLoading;
  const error = assistantQuery.error as Error | null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <LoadingStep message="Initializing mock interview session..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Error
          </h2>
          <p className="text-destructive/80 mb-4">
            {error.message || "Failed to initialize mock interview"}
          </p>
          <Button onClick={() => router.refresh()} variant="destructive">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!initialJob) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
          <p className="text-destructive/80">Job information not found</p>
        </div>
      </div>
    );
  }

  if (mockInterview.isConnecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <LoadingStep message="Connecting to mock interview session..." />
      </div>
    );
  }

  if (mockInterview.isSubmitting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <LoadingStep message="Submitting mock interview and analyzing responses..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        <InterviewHeader job={initialJob} />

        <InterviewControls
          isConnected={mockInterview.isConnected}
          isSpeaking={mockInterview.isSpeaking}
          timeRemaining={mockInterview.timeRemaining}
          onStart={mockInterview.startCall}
          onEnd={mockInterview.endInterview}
          disabled={!assistantQuery.data?.assistantId || !clientKey}
        />
      </div>
    </div>
  );
}

