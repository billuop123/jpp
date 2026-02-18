import { FileText } from "lucide-react";
import MotionDiv from "@/components/MotionDiv";
import { Card, CardContent } from "@/components/ui/card";

interface DetailedAnalysisCardProps {
  comment: string | null;
}

export function DetailedAnalysisCard({ comment }: DetailedAnalysisCardProps) {
  if (!comment) return null;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.7 }}
    >
      <Card 
        className="border !shadow-none bg-white hover:border-primary/50 transition-colors"
        style={{ borderRadius: 0 }}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Detailed Analysis</h3>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {comment}
            </p>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  );
}

