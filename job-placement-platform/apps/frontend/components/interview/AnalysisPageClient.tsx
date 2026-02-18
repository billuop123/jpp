"use client";

import LoadingStep from "@/components/LoadingStep";
import {
  Code,
  MessageSquare,
  Lightbulb,
  Target,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

import { AnalysisHeader } from "@/components/interview/AnalysisHeader";
import { OverallScore } from "@/components/interview/OverallScore";
import { ScoreCard } from "@/components/interview/ScoreCard";
import { StrengthsCard } from "@/components/interview/StrengthsCard";
import { WeaknessesCard } from "@/components/interview/WeaknessesCard";
import { DetailedAnalysisCard } from "@/components/interview/DetailedAnalysisCard";
import { AnalysisEmptyState } from "@/components/interview/AnalysisEmptyState";
import { InterviewRadarChart } from "@/components/interview/InterviewRadarChart";
import type { ApplicationData } from "@/components/interview/types";
import { Button } from "@/components/ui/button";

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
  const maxOverallScore = 10; // Sum of 5 scores (0-2 each)
  const overallPercentage = (overallScore / maxOverallScore) * 100;

  if (!hasAnalysis) {
    return <AnalysisEmptyState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AnalysisHeader job={application.job} />
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back home
            </Link>
          </Button>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <ScoreCard
            icon={Code}
            label="Technical Skills"
            score={application.technicalScore}
            index={0}
          />
          <ScoreCard
            icon={MessageSquare}
            label="Communication"
            score={application.communicationScore}
            index={1}
          />
          <ScoreCard
            icon={Lightbulb}
            label="Problem Solving"
            score={application.problemSolvingScore}
            index={2}
          />
          <ScoreCard
            icon={Target}
            label="Job Relevance"
            score={application.jobRelevanceScore}
            index={3}
          />
          <ScoreCard
            icon={BookOpen}
            label="Depth of Knowledge"
            score={application.depthOfKnowledgeScore}
            index={4}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StrengthsCard strengths={application.strengths} />
          <WeaknessesCard weaknesses={application.weaknesses} />
        </div>

        <DetailedAnalysisCard comment={application.relevancecomment} />
      </div>
    </div>
  );
}

