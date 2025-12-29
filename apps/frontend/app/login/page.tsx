"use client";

import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { LogIn, Github, Chrome } from "lucide-react";

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
              <Chrome className="mr-2 h-4 w-4" />
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


