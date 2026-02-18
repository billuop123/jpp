import { CheckCircle2 } from "lucide-react";
import MotionDiv from "@/components/MotionDiv";
import { Card, CardContent } from "@/components/ui/card";

interface StrengthsCardProps {
  strengths: string | null;
}

export function StrengthsCard({ strengths }: StrengthsCardProps) {
  return (
    <MotionDiv
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <Card 
        className="border !shadow-none bg-white hover:border-green-500/50 transition-colors"
        style={{ borderRadius: 0 }}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-green-500/10">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Strengths</h3>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {strengths || "No strengths identified."}
            </p>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  );
}

