import { TrendingUp } from "lucide-react";
import MotionDiv from "@/components/MotionDiv";
import { cn } from "@/scripts/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface OverallScoreProps {
  score: number;
  maxScore: number;
  percentage: number;
}

export function OverallScore({ score, maxScore, percentage }: OverallScoreProps) {
  const getPerformanceText = () => {
    if (percentage >= 80) return "Excellent Performance";
    if (percentage >= 60) return "Good Performance";
    if (percentage >= 40) return "Average Performance";
    return "Needs Improvement";
  };

  const getPerformanceColor = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card 
        className="border !shadow-none bg-white"
        style={{ borderRadius: 0 }}
      >
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wide">Overall Score</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-6xl font-bold">
                {score}/{maxScore}
              </h2>
              <span className="text-3xl text-muted-foreground">
                ({Math.round(percentage)}%)
              </span>
            </div>
            <p className={cn("text-xl font-medium", getPerformanceColor())}>
              {getPerformanceText()}
            </p>
          </div>
          <div className="w-32 h-32 flex items-center justify-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-muted/20"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                  className={cn(
                    percentage >= 80 ? "text-green-600" :
                    percentage >= 60 ? "text-yellow-600" :
                    percentage >= 40 ? "text-orange-600" :
                    "text-red-600"
                  )}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
        </CardContent>
      </Card>
    </MotionDiv>
  );
}

