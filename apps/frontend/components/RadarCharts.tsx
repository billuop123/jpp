"use client";

import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "Radar chart of interview scoring dimensions";

export type RadarScores = {
  technicalScore: number | null;
  communicationScore: number | null;
  problemSolvingScore: number | null;
  jobRelevanceScore: number | null;
  depthOfKnowledgeScore: number | null;
};

const chartConfig = {
  score: {
    label: "Score",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ChartRadarDots({ scores }: { scores: RadarScores }) {
  const chartData = [
    { metric: "Technical", score: scores.technicalScore ?? 0 },
    { metric: "Communication", score: scores.communicationScore ?? 0 },
    { metric: "Problem solving", score: scores.problemSolvingScore ?? 0 },
    { metric: "Job relevance", score: scores.jobRelevanceScore ?? 0 },
    { metric: "Depth of knowledge", score: scores.depthOfKnowledgeScore ?? 0 },
  ];

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Skill radar</CardTitle>
        <CardDescription>
          Interview scoring across key dimensions
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="metric" />
            <PolarGrid />
            <Radar
              dataKey="score"
              fill="var(--color-score)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Scored 0–2 per dimension <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          Higher is better across all axes.
        </div>
      </CardFooter>
    </Card>
  );
}


