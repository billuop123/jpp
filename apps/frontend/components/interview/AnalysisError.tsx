interface AnalysisErrorProps {
  message: string;
}

export function AnalysisError({ message }: AnalysisErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-destructive/10 border border-destructive/20 p-6 max-w-md" style={{ borderRadius: 0 }}>
        <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
        <p className="text-destructive/80">{message}</p>
      </div>
    </div>
  );
}

