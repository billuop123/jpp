import React from 'react';
import { Button } from '@/components/ui/button';

interface InterviewControlsProps {
  isConnected: boolean;
  isSpeaking: boolean;
  timeRemaining: number;
  onStart: () => void;
  onEnd: () => void;
  disabled?: boolean;
}

export function InterviewControls({
  isConnected,
  isSpeaking,
  timeRemaining,
  onStart,
  onEnd,
  disabled = false,
}: InterviewControlsProps) {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full transition-colors ${
              isSpeaking
                ? 'bg-destructive animate-pulse'
                : isConnected
                ? 'bg-green-500'
                : 'bg-muted'
            }`}
          />
          <span className="font-medium text-foreground">
            {isSpeaking
              ? 'Interviewer Speaking'
              : isConnected
              ? 'Interview in Progress'
              : 'Ready to Start'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {isConnected && (
            <>
              <div className="text-lg font-mono font-semibold text-foreground">
                {formatTime(timeRemaining)}
              </div>
              <Button onClick={onEnd} variant="destructive" size="sm">
                End Interview
              </Button>
            </>
          )}
        </div>
      </div>

      {!isConnected && (
        <Button
          onClick={onStart}
          disabled={disabled}
          className="w-full"
          size="lg"
        >
          🎤 Start Interview
        </Button>
      )}

      {isConnected && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Listen carefully and answer each question. The interview will automatically end after 5 minutes.</p>
        </div>
      )}
    </div>
  );
}

