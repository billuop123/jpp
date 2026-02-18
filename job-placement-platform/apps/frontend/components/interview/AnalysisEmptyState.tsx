import { FileText } from "lucide-react";

interface AnalysisEmptyStateProps {
  message?: string;
}

export function AnalysisEmptyState({ message }: AnalysisEmptyStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="border p-8 max-w-md text-center space-y-4">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
        <h2 className="text-xl font-semibold">Analysis Not Available</h2>
        <p className="text-muted-foreground">
          {message ||
            "The interview analysis has not been completed yet. Please wait for the analysis to be processed."}
        </p>
      </div>
    </div>
  );
}

