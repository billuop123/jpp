"use client";

import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { LogIn, Github } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import AnimatedGrid from "@/components/home/AnimatedGrid";

export default function LoginPage() {
  const { status } = useSession();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <AnimatedGrid
        numSquares={20}
        maxOpacity={0.18}
        duration={4}
        repeatDelay={0.6}
        className="absolute inset-0 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
      />

      <div className="relative w-full max-w-md">
        <Card className="backdrop-blur-md bg-card/80 border-primary/10 shadow-xl">
          <CardHeader className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <LogIn className="h-3 w-3" />
              <span>Welcome back</span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              Sign in to JobPlace
            </CardTitle>
            <CardDescription>
              Continue with your preferred provider to access your dashboard and
              personalized job matches.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {status === "authenticated" && (
              <p className="text-sm text-muted-foreground text-center">
                You are already signed in. You can still continue below to re-authenticate
                with a different provider.
              </p>
            )}
            <Button
              type="button"
              className="w-full"
              size="lg"
              onClick={() => signIn("google", { callbackUrl })}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <Button
              type="button"
              className="w-full"
              size="lg"
              variant="outline"
              onClick={() => signIn("github", { callbackUrl })}
            >
              <Github className="mr-2 h-4 w-4" />
              Continue with GitHub
            </Button>

            <p className="mt-2 text-xs text-muted-foreground text-center">
              By continuing, you agree to our terms of service and privacy
              policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


