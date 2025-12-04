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
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(INTERVIEW_DURATION_MS);
  
  const vapiRef = useRef<Vapi | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const conversationRef = useRef<Array<{role: string, text: string}>>([]);
  const endInterviewRef = useRef<(() => Promise<void>) | null>(null);
  const isEndingRef = useRef<boolean>(false);

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
    if (isEndingRef.current) {
      return;
    }
    isEndingRef.current = true;
    
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
        router.push(`/interview/analysis/${applicationId}`);
      } catch (error) {
        console.error('Error ending interview:', error);
        alert('Failed to submit interview. Please try again.');
        isEndingRef.current = false;
      }
    } else {
      router.push(`/applications`);
    }
  }, [formatConversationHistory, saveConversationMutation, analyzeInterviewMutation, router, applicationId]);

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
    let functionCalledRef = { current: false };

    const finalizeMessages = () => {
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
    };

    const handleFunctionCall = (functionCall: any) => {
      if ((functionCall.function?.name === 'endInterview' || functionCall.name === 'endInterview') && endInterviewRef.current) {
        console.log('Interviewer finished asking questions, auto-submitting interview');
        
        functionCalledRef.current = true;
        
        if (vapiRef.current) {
          try {
            vapiRef.current.stop();
            setIsConnected(false);
            setIsConnecting(false);
            setIsSpeaking(false);
          } catch (error) {
            console.error('Error stopping VAPI:', error);
          }
        }
        
        finalizeMessages();
        
        if (endInterviewRef.current) {
          endInterviewRef.current();
        }
      }
    };

    const checkInterviewComplete = (text: string): boolean => {
      // Check for the special completion marker from the interviewer
      if (text.includes('[INTERVIEW_COMPLETE]')) {
        return true;
      }
      
      // Fallback: Check for common completion phrases from interviewer
      // Only trigger if it's clearly a closing statement
      const lowerText = text.toLowerCase();
      
      // Strong completion indicators (must include one of these)
      const strongIndicators = [
        'i\'ve finished asking',
        'i have finished asking',
        'interview is now complete',
        'interview is complete',
        'that concludes our interview',
        'we\'ve finished the interview',
        'we have finished the interview',
        'i\'ve completed the interview',
        'i have completed the interview',
        'that\'s all the questions i have',
        'that is all the questions i have',
        'no further questions',
        'interview has concluded',
        'thank you for your time. i\'ve finished',
        'thank you for your time. i have finished'
      ];
      
      // Check if it contains a strong indicator
      const hasStrongIndicator = strongIndicators.some(phrase => lowerText.includes(phrase));
      
      // Also check for thank you + completion context (more lenient)
      const hasThankYou = lowerText.includes('thank you for your time') || lowerText.includes('thank you for participating');
      const hasCompletionContext = lowerText.includes('finished') || lowerText.includes('complete') || lowerText.includes('conclude');
      
      // Must be a relatively short statement (closing statements are brief, not long explanations)
      const isShortStatement = text.length < 250;
      
      // Trigger if: (strong indicator) OR (thank you + completion context + short)
      return (hasStrongIndicator || (hasThankYou && hasCompletionContext)) && isShortStatement;
    };

    const checkCandidateWantsToEnd = (text: string): boolean => {
      const lowerText = text.toLowerCase();
      const endPhrases = [
        'end the interview',
        'end interview',
        'stop the interview',
        'stop interview',
        'finish the interview',
        'finish interview',
        'i want to end',
        'can we end',
        'can we stop',
        'i\'d like to end',
        'i would like to end',
        'let\'s end',
        'lets end',
        'i\'m done',
        'im done',
        'i am done',
        'that\'s all',
        'thats all',
        'i\'m finished',
        'im finished',
        'i am finished'
      ];
      return endPhrases.some(phrase => lowerText.includes(phrase));
    };

    const handleTranscript = (message: any) => {
      const role = message.role || (message.type === 'user-transcript' ? 'user' : 'assistant');
      const text = message.transcript || message.text || message.content || message.message || '';
      
      if (!text || text.trim().length === 0) return;
      
      // Check if interviewer has signaled interview completion
      if (role === 'assistant' && checkInterviewComplete(text) && endInterviewRef.current && !isEndingRef.current) {
        console.log('Interviewer finished asking questions, auto-submitting interview');
        finalizeMessages();
        // Add the current message before ending (remove the marker)
        const existingText = messagesByRole.get(role) || '';
        const fullText = existingText.length > text.length ? existingText : text;
        const cleanedText = fullText.replace(/\[INTERVIEW_COMPLETE\]/g, '').trim();
        if (cleanedText) {
          conversationRef.current.push({
            role,
            text: cleanedText,
          });
        }
        
        if (vapiRef.current) {
          try {
            vapiRef.current.stop();
            setIsConnected(false);
            setIsConnecting(false);
            setIsSpeaking(false);
          } catch (error) {
            console.error('Error stopping VAPI:', error);
          }
        }
        
        if (endInterviewRef.current) {
          endInterviewRef.current();
        }
        return;
      }
      
      // Check if candidate wants to end the interview
      if (role === 'user' && checkCandidateWantsToEnd(text) && endInterviewRef.current && !isEndingRef.current) {
        console.log('Candidate requested to end interview, auto-submitting');
        finalizeMessages();
        // Add the current message before ending
        const existingText = messagesByRole.get(role) || '';
        const fullText = existingText.length > text.length ? existingText : text;
        if (fullText.trim()) {
          conversationRef.current.push({
            role,
            text: fullText.trim(),
          });
        }
        
        if (vapiRef.current) {
          try {
            vapiRef.current.stop();
            setIsConnected(false);
            setIsConnecting(false);
            setIsSpeaking(false);
          } catch (error) {
            console.error('Error stopping VAPI:', error);
          }
        }
        
        if (endInterviewRef.current) {
          endInterviewRef.current();
        }
        return;
      }
      
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
    };

    const commitMessageOnSpeechEnd = () => {
      if (lastCommittedRole) {
        const text = messagesByRole.get(lastCommittedRole);
        if (text && text.trim()) {
          // Check if this is the interviewer completing the interview
          if (lastCommittedRole === 'assistant' && checkInterviewComplete(text) && endInterviewRef.current && !isEndingRef.current) {
            console.log('Interviewer finished asking questions (detected on speech end), auto-submitting interview');
            const cleanedText = text.replace(/\[INTERVIEW_COMPLETE\]/g, '').trim();
            if (cleanedText) {
              conversationRef.current.push({
                role: lastCommittedRole,
                text: cleanedText,
              });
            }
            messagesByRole.delete(lastCommittedRole);
            lastCommittedRole = null;
            
            if (vapiRef.current) {
              try {
                vapiRef.current.stop();
                setIsConnected(false);
                setIsConnecting(false);
                setIsSpeaking(false);
              } catch (error) {
                console.error('Error stopping VAPI:', error);
              }
            }
            
            if (endInterviewRef.current) {
              endInterviewRef.current();
            }
            return;
          }
          
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
    };

    vapiInstance.on('call-start', () => {
      console.log('Call started');
      setIsConnected(true);
      setIsConnecting(false);
      isEndingRef.current = false;
      startTimeRef.current = Date.now();
      setTimeRemaining(INTERVIEW_DURATION_MS);
      conversationRef.current = [];
      messagesByRole.clear();
      lastCommittedRole = null;
    });

    vapiInstance.on('call-end', () => {
      console.log('Call ended');
      setIsConnected(false);
      setIsConnecting(false);
      setIsSpeaking(false);
      finalizeMessages();
      
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
      commitMessageOnSpeechEnd();
    });

    vapiInstance.on('message', (message: any) => {
      if (message.type === 'function-call' || message.functionCall || message.function) {
        const functionCall = message.functionCall || message.function || message;
        console.log('Function call received via message event:', functionCall);
        handleFunctionCall(functionCall);
        return;
      }
      
      const isTranscript = 
        message.type === 'transcript' || 
        message.type === 'user-transcript' || 
        message.type === 'assistant-message' ||
        message.transcript !== undefined ||
        message.text !== undefined;
      
      if (isTranscript) {
        handleTranscript(message);
      }
    });

    (vapiInstance.on as any)('function-call', (functionCall: any) => {
      console.log('Function call event received:', functionCall);
      handleFunctionCall(functionCall);
    });

    vapiInstance.on('error', (error: any) => {
      console.error('Vapi error:', error);
      setIsConnecting(false);
    });

    return () => {
      if (vapiInstance) {
        vapiInstance.stop();
      }
    };
  }, [apiKey, assistantId]);

  const startCall = useCallback(() => {
    if (vapiRef.current && assistantId) {
      setIsConnecting(true);
      vapiRef.current.start(assistantId);
    }
  }, [assistantId]);

  return {
    isConnected,
    isConnecting,
    isSpeaking,
    timeRemaining,
    startCall,
    endInterview,
    isSubmitting: saveConversationMutation.isPending || analyzeInterviewMutation.isPending,
  };
}
