"use client";
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL } from '@/scripts/lib/config';
import { useUser } from '@/store/user';
import { Button } from '@/components/ui/button';
import LoadingStep from '@/components/LoadingStep';
import { InterviewHeader } from '@/components/interview/InterviewHeader';
import { InterviewControls } from '@/components/interview/InterviewControls';
import { useInterview } from '@/components/interview/useInterview';
import { useEffect } from 'react';

export default function InterviewPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { token } = useUser();
  const router=useRouter()
  const interviewExistsQuery = useQuery({
    queryKey: ['interview-exists', applicationId],
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/applications/${applicationId}/interview-exists`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Failed to check if interview exists');
      }
      const status=await response.json()
      if(status.status){
        router.push(`/interview/analysis/${applicationId}`);
      }
      return status;
    },
    enabled: !!applicationId,
    retry: false,
  });
  useEffect(()=>{
    if(interviewExistsQuery.isSuccess){
      if(interviewExistsQuery.data?.status){
        router.push(`/interview/analysis/${applicationId}`);
      }
    }
  },[interviewExistsQuery.isSuccess]);
  const applicationQuery = useQuery({
    queryKey: ['application', applicationId],
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/applications/${applicationId}`, {
        headers: {
          'Authorization': token!,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch application details');
      }
      return response.json();
    },
    enabled: !!token && !!applicationId,
    retry: false,
  });
  const clientKeyQuery = useQuery({
    queryKey: ['vapi-client-key'],
    retry: false,
    enabled: !!token && !!applicationId,
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/vapi/client-key`, {
        headers: {
          'Authorization': token!,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to get VAPI client key');
      }
      return response.json();
    },
  });

  const assistantQuery = useQuery({
    queryKey: ['vapi-assistant', applicationId],
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/vapi/call-assistant/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token!,
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create assistant');
      }
      return response.json();
    },
    enabled: !!token && !!applicationId && !!clientKeyQuery.data,
    retry: false,
  });

  const interview = useInterview({
    applicationId: applicationId as string,
    apiKey: clientKeyQuery.data?.key || '',
    assistantId: assistantQuery.data?.assistantId || '',
    token: token || '',
  });

  const isLoading = 
    applicationQuery.isLoading || 
    clientKeyQuery.isLoading || 
    assistantQuery.isLoading;
  const error = applicationQuery.error || clientKeyQuery.error || assistantQuery.error;

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground mb-4">
          Please sign in to start the interview.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
          <p className="text-destructive/80 mb-4">
            {error instanceof Error ? error.message : 'Failed to initialize interview'}
          </p>
          <Button
            onClick={() => {
              applicationQuery.refetch();
              clientKeyQuery.refetch();
              assistantQuery.refetch();
            }}
            variant="destructive"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

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

  if (!applicationQuery.data?.job) {
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
        <InterviewHeader job={applicationQuery.data.job} />
        
        <InterviewControls
          isConnected={interview.isConnected}
          isSpeaking={interview.isSpeaking}
          timeRemaining={interview.timeRemaining}
          onStart={interview.startCall}
          onEnd={interview.endInterview}
          disabled={!assistantQuery.data?.assistantId || !clientKeyQuery.data?.key}
        />
      </div>
    </div>
  );
}
