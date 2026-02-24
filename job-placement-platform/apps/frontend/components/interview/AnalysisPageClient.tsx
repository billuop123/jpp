"use client";

import LoadingStep from "@/components/LoadingStep";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AnalysisHeader } from "@/components/interview/AnalysisHeader";
import { OverallScore } from "@/components/interview/OverallScore";
import { AnalysisEmptyState } from "@/components/interview/AnalysisEmptyState";
import { InterviewRadarChart } from "@/components/interview/InterviewRadarChart";
import type { ApplicationData } from "@/components/interview/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AnalysisPageClientProps {
  application: ApplicationData | null;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export default function AnalysisPageClient({
  application,
  isLoading = false,
  errorMessage = null,
}: AnalysisPageClientProps) {
  if (isLoading) {
    return <LoadingStep message="Loading application details..." />;
  }

  if (errorMessage) {
    return <AnalysisEmptyState message={errorMessage} />;
  }

  if (!application) {
    return null;
  }

  const hasAnalysis = application.relevanceScore !== null;
  const overallScore = application.relevanceScore ?? 0;
  const maxOverallScore = 10;
  const overallPercentage = (overallScore / maxOverallScore) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AnalysisHeader job={application.job} />
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back home
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-semibold">Interview Recorded Successfully</h2>
            <p className="text-muted-foreground max-w-md">
              Your interview has been recorded and submitted. Once the evaluation process is complete, the recruiter will contact you with the results.
            </p>
          </CardContent>
        </Card>

        {hasAnalysis && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <OverallScore
                  score={overallScore}
                  maxScore={maxOverallScore}
                  percentage={overallPercentage}
                />
              </div>
              <div className="lg:col-span-1">
                <InterviewRadarChart
                  technicalScore={application.technicalScore}
                  communicationScore={application.communicationScore}
                  problemSolvingScore={application.problemSolvingScore}
                  jobRelevanceScore={application.jobRelevanceScore}
                  depthOfKnowledgeScore={application.depthOfKnowledgeScore}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

