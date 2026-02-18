/**
 * Detects when the interviewer has finished the interview.
 */
export function checkInterviewComplete(text: string): boolean {
  // Check for the special completion marker from the interviewer
  if (text.includes('[INTERVIEW_COMPLETE]')) {
    return true;
  }

  // Fallback: Check for common completion phrases from interviewer
  // Only trigger if it's clearly a closing statement
  const lowerText = text.toLowerCase();

  // Strong completion indicators (must include one of these)
  const strongIndicators = [
    "i've finished asking",
    'i have finished asking',
    'interview is now complete',
    'interview is complete',
    'that concludes our interview',
    "we've finished the interview",
    'we have finished the interview',
    "i've completed the interview",
    'i have completed the interview',
    "that's all the questions i have",
    'that is all the questions i have',
    'no further questions',
    'interview has concluded',
    "thank you for your time. i've finished",
    'thank you for your time. i have finished',
  ];

  // Check if it contains a strong indicator
  const hasStrongIndicator = strongIndicators.some((phrase) =>
    lowerText.includes(phrase),
  );

  // Also check for thank you + completion context (more lenient)
  const hasThankYou =
    lowerText.includes('thank you for your time') ||
    lowerText.includes('thank you for participating');
  const hasCompletionContext =
    lowerText.includes('finished') ||
    lowerText.includes('complete') ||
    lowerText.includes('conclude');

  // Must be a relatively short statement (closing statements are brief, not long explanations)
  const isShortStatement = text.length < 250;

  // Trigger if: (strong indicator) OR (thank you + completion context + short)
  return (hasStrongIndicator || (hasThankYou && hasCompletionContext)) && isShortStatement;
}

/**
 * Detects when the candidate wants to end the interview.
 */
export function checkCandidateWantsToEnd(text: string): boolean {
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
    "i'd like to end",
    'i would like to end',
    "let's end",
    'lets end',
    "i'm done",
    'im done',
    'i am done',
    "that's all",
    'thats all',
    "i'm finished",
    'im finished',
    'i am finished',
  ];
  return endPhrases.some((phrase) => lowerText.includes(phrase));
}


