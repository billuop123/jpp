"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface InterviewRadarChartProps {
  technicalScore: number | null;
  communicationScore: number | null;
  problemSolvingScore: number | null;
  jobRelevanceScore: number | null;
  depthOfKnowledgeScore: number | null;
}

export function InterviewRadarChart({
  technicalScore,
  communicationScore,
  problemSolvingScore,
  jobRelevanceScore,
  depthOfKnowledgeScore,
}: InterviewRadarChartProps) {
  const maxScore = 2;
  
  const chartData = [
    {
      category: "Technical",
      score: technicalScore ?? 0,
      fullMark: maxScore,
    },
    {
      category: "Communication",
      score: communicationScore ?? 0,
      fullMark: maxScore,
    },
    {
      category: "Problem Solving",
      score: problemSolvingScore ?? 0,
      fullMark: maxScore,
    },
    {
      category: "Job Relevance",
      score: jobRelevanceScore ?? 0,
      fullMark: maxScore,
    },
    {
      category: "Knowledge Depth",
      score: depthOfKnowledgeScore ?? 0,
      fullMark: maxScore,
    },
  ];

  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card 
      className="border !shadow-none bg-white"
      style={{ borderRadius: 0 }}
    >
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>
          Visual representation of interview scores across key areas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[400px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="category" />
            <PolarGrid />
            <Radar
              dataKey="score"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.6}
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{
                r: 5,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

