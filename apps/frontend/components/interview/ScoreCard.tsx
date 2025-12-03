import MotionDiv from "@/components/MotionDiv";
import { cn } from "@/scripts/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface ScoreCardProps {
  icon: React.ElementType;
  label: string;
  score: number | null;
  maxScore?: number;
  index: number;
}

export function ScoreCard({ 
  icon: Icon, 
  label, 
  score, 
  maxScore = 2,
  index 
}: ScoreCardProps) {
  const percentage = score !== null ? (score / maxScore) * 100 : 0;
  
  const getColorClass = (percentage: number) => {
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card 
        className="border !shadow-none bg-white hover:border-primary/50 transition-colors"
        style={{ borderRadius: 0 }}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</h3>
                <p className="text-3xl font-bold">
                  {score !== null ? `${score}/${maxScore}` : "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-muted/50 overflow-hidden">
              <div
                className={cn("h-full transition-all duration-700 ease-out", getColorClass(percentage))}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{score !== null ? `${score}/${maxScore}` : "N/A"}</span>
              <span className="text-xs font-medium text-muted-foreground">{percentage.toFixed(0)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  );
}

