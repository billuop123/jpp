import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Vapi from '@vapi-ai/web';
import { BACKEND_URL } from '@/scripts/lib/config';

const INTERVIEW_DURATION_MS = 5 * 60 * 1000; 

interface UseInterviewProps {
  applicationId: string;
  apiKey: string;
  assistantId: string;
  token: string;
}

export function useInterview({ applicationId, apiKey, assistantId, token }: UseInterviewProps) {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(INTERVIEW_DURATION_MS);
  const vapiRef = useRef<Vapi | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const conversationRef = useRef<Array<{role: string, text: string}>>([]);
  const endInterviewRef = useRef<(() => Promise<void>) | null>(null);
  const saveConversationMutation = useMutation({
    mutationFn: async (history: string) => {
      const response = await fetch(`${BACKEND_URL}/vapi/save-conversation/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ conversationHistory: history }),
      });
      if (!response.ok) {
        throw new Error('Failed to save conversation');
      }
      return response.json();
    },
  });
  const analyzeInterviewMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${BACKEND_URL}/applications/${applicationId}/analyze`, {
        method: 'PATCH',
        headers: {
          'Authorization': token,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to analyze interview');
      }
      return response.json();
    },
  });

  const formatConversationHistory = useCallback(() => {
    return conversationRef.current
      .map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.text}`)
      .join('\n\n');
  }, []);


  const endInterview = useCallback(async () => {
    if (vapiRef.current) {
      try {
        vapiRef.current.stop();
      } catch (error) {
        console.error('Error stopping VAPI:', error);
      }
    }
    
    setIsConnected(false);
    setIsSpeaking(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const history = formatConversationHistory();
    if (history.trim()) {
      try {
        await saveConversationMutation.mutateAsync(history);
        await analyzeInterviewMutation.mutateAsync();
      } catch (error) {
        console.error('Error ending interview:', error);
        alert('Failed to submit interview. Please try again.');
      }
    } else {
      router.push(`/applications`);
    }
  }, [formatConversationHistory, saveConversationMutation, analyzeInterviewMutation, router, applicationId, isConnected]);
  useEffect(() => {
    endInterviewRef.current = endInterview;
  }, [endInterview]);

  useEffect(() => {
    if (!isConnected || startTimeRef.current === null) return;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current!;
      const remaining = Math.max(0, INTERVIEW_DURATION_MS - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0 && endInterviewRef.current) {
        endInterviewRef.current();
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isConnected]);

  useEffect(() => {
    if (!apiKey || !assistantId) return;

    const vapiInstance = new Vapi(apiKey);
    vapiRef.current = vapiInstance;

    const messagesByRole = new Map<string, string>();
    let lastCommittedRole: string | null = null;

    vapiInstance.on('call-start', () => {
      console.log('Call started');
      setIsConnected(true);
      startTimeRef.current = Date.now();
      setTimeRemaining(INTERVIEW_DURATION_MS);
      conversationRef.current = [];
      messagesByRole.clear();
      lastCommittedRole = null;
    });

    vapiInstance.on('call-end', () => {
      console.log('Call ended');
      setIsConnected(false);
      setIsSpeaking(false);
      
      // Finalize any pending messages
      messagesByRole.forEach((text, role) => {
        if (text.trim()) {
          conversationRef.current.push({
            role,
            text: text.trim(),
          });
        }
      });
      messagesByRole.clear();
      lastCommittedRole = null;
      if (endInterviewRef.current) {
        endInterviewRef.current();
      }
    });

    vapiInstance.on('speech-start', () => {
      console.log('Assistant started speaking');
      setIsSpeaking(true);
    });

    vapiInstance.on('speech-end', () => {
      console.log('Assistant stopped speaking');
      setIsSpeaking(false);
      // Commit current message when speech ends
      if (lastCommittedRole) {
        const text = messagesByRole.get(lastCommittedRole);
        if (text && text.trim()) {
          const alreadyCommitted = conversationRef.current.some(msg => 
            msg.role === lastCommittedRole && msg.text === text.trim()
          );
          if (!alreadyCommitted) {
            conversationRef.current.push({
              role: lastCommittedRole,
              text: text.trim(),
            });
          }
          messagesByRole.delete(lastCommittedRole);
          lastCommittedRole = null;
        }
      }
    });

    vapiInstance.on('message', (message: any) => {
      const isTranscript = 
        message.type === 'transcript' || 
        message.type === 'user-transcript' || 
        message.type === 'assistant-message' ||
        message.transcript !== undefined ||
        message.text !== undefined;
      
      if (isTranscript) {
        const role = message.role || (message.type === 'user-transcript' ? 'user' : 'assistant');
        const text = message.transcript || message.text || message.content || message.message || '';
        
        if (!text || text.trim().length === 0) return;
        if (lastCommittedRole && lastCommittedRole !== role) {
          const prevText = messagesByRole.get(lastCommittedRole);
          if (prevText && prevText.trim()) {
            conversationRef.current.push({
              role: lastCommittedRole,
              text: prevText.trim(),
            });
            messagesByRole.delete(lastCommittedRole);
          }
        }
        const existingText = messagesByRole.get(role) || '';
        if (text.length > existingText.length || text !== existingText) {
          messagesByRole.set(role, text);
          lastCommittedRole = role;
        }
      }
    });

    vapiInstance.on('error', (error: any) => {
      console.error('Vapi error:', error);
    });

    return () => {
      if (vapiInstance) {
        vapiInstance.stop();
      }
    };
  }, [apiKey, assistantId]);

  const startCall = useCallback(() => {
    if (vapiRef.current && assistantId) {
      vapiRef.current.start(assistantId);
    }
  }, [assistantId]);

  return {
    isConnected,
    isSpeaking,
    timeRemaining,
    startCall,
    endInterview,
    isSubmitting: saveConversationMutation.isPending || analyzeInterviewMutation.isPending,
  };
}

