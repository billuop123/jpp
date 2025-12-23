"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
            <p className="text-destructive/80 mb-4">
              {error.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}




