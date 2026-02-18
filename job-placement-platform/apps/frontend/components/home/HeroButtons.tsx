"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import MotionDiv from "../MotionDiv";

export default function HeroButtons({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
    >
      {isAuthenticated ? (
        <>
          <Button
            size="lg"
            className="text-lg px-8"
            onClick={() => router.push("/jobs")}
          >
            Browse Jobs
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8"
            onClick={() => router.push("/user-details")}
          >
            Complete Profile
          </Button>
        </>
      ) : (
        <>
          <Button
            size="lg"
            className="text-lg px-8"
            onClick={() => router.push("/api/auth/signin")}
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8"
            onClick={() => router.push("/jobs")}
          >
            Browse Jobs
          </Button>
        </>
      )}
    </MotionDiv>
  );
}



