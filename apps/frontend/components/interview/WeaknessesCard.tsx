import { XCircle } from "lucide-react";
import MotionDiv from "@/components/MotionDiv";
import { Card, CardContent } from "@/components/ui/card";

interface WeaknessesCardProps {
  weaknesses: string | null;
}

export function WeaknessesCard({ weaknesses }: WeaknessesCardProps) {
  return (
    <MotionDiv
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.6 }}
    >
      <Card 
        className="border !shadow-none bg-white hover:border-red-500/50 transition-colors"
        style={{ borderRadius: 0 }}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-500/10">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold">Areas for Improvement</h3>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {weaknesses || "No areas for improvement identified."}
            </p>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  );
}

