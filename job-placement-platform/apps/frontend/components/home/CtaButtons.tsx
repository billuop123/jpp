"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import MotionDiv from "../MotionDiv";

export default function CtaButtons({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="pt-4"
    >
      {isAuthenticated ? (
        <Button
          size="lg"
          className="text-lg px-8"
          onClick={() => router.push("/jobs")}
        >
          Explore Jobs
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      ) : (
        <Button
          size="lg"
          className="text-lg px-8"
          onClick={() => router.push("/api/auth/signin")}
        >
          Get Started Now
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      )}
    </MotionDiv>
  );
}



