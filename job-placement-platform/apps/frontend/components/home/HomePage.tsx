import { FloatingHeader } from "@/components/ui/floating-header";
import { Feature } from "@/components/ui/feature-with-advantages";

import { Sparkles, Target, Zap } from "lucide-react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";
import AnimatedGrid from "./AnimatedGrid";
import MotionDiv from "../MotionDiv";
import MotionH1 from "../MotionH1";
import MotionH2 from "../MotionH2";
import MotionP from "../MotionP";
import {
  UnauthorizedHandler,
  HeroButtons,
  PremiumSectionWithCheckout,
  CtaButtons,
} from "./HomeClientHooks";

type PremiumStatus = {
  isPremium: boolean;
  isTailoringPremium?: boolean;
  isMockInterviewsPremium?: boolean;
};

interface HomePageProps {
  session: Session | null;
  premiumStatus: PremiumStatus | null;
}

export default function HomePage({ session, premiumStatus }: HomePageProps) {
  const isAuthenticated = !!session;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <UnauthorizedHandler />
      <AnimatedGrid />
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <FloatingHeader />
        </div>

        {/* Hero Section */}
        <section className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="absolute inset-0 opacity-10">
          <img src="/bg-image2.png" alt="" className="w-full h-full object-cover" />
        </div>
        <AnimatedGrid numSquares={20} maxOpacity={0.2} duration={4} repeatDelay={0.5} className="absolute inset-0 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]" />
          <div className="relative max-w-4xl mx-auto text-center space-y-8">
            <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-card">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Job Matching</span>
            </MotionDiv>
            
            <MotionH1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight font-[family-name:var(--font-display)]"
            >
              <span className="text-foreground/80">Job-यात्रा</span>
            </MotionH1>
            
            <MotionP
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Upload your resume and let our AI find your perfect match. Get personalized job recommendations based on your skills and experience.
            </MotionP>
            <HeroButtons isAuthenticated={isAuthenticated} />

            {isAuthenticated && session?.user?.role && (
              <MotionDiv
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="flex flex-col items-center gap-2 pt-4"
              >
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Continue where you left off
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {session.user.role === "CANDIDATE" && (
                    <Button asChild size="sm" variant="outline">
                      <Link href="/candidatedashboard">Open candidate dashboard</Link>
                    </Button>
                  )}
                  {session.user.role === "RECRUITER" && (
                    <Button asChild size="sm" variant="outline">
                      <Link href="/recruiterdashboard">Open recruiter dashboard</Link>
                    </Button>
                  )}
                  {session.user.role === "ADMIN" && (
                    <Button asChild size="sm" variant="outline">
                      <Link href="/admindashboard">Open admin dashboard</Link>
                    </Button>
                  )}
                </div>
              </MotionDiv>
            )}
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <PremiumSectionWithCheckout
            session={session}
            isAuthenticated={isAuthenticated}
            premiumAccess={premiumStatus}
          />
        </section>

        {/* Features Section */}
        <section className="relative">
            <AnimatedGrid numSquares={25} maxOpacity={0.15} duration={5} repeatDelay={0.8} className="absolute inset-0 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"/>
          <div className="relative">
            <Feature />
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative container mx-auto px-4 py-20 lg:py-32" id="about">
          <AnimatedGrid numSquares={20} maxOpacity={0.2} duration={4} repeatDelay={0.5} className="absolute inset-0 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"/>
          <div className="relative max-w-4xl mx-auto">
            <MotionDiv
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border bg-card p-8 md:p-12 text-center space-y-6"
            >
              <MotionDiv
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4"
              >
                <Target className="w-8 h-8 text-primary" />
              </MotionDiv>
              <MotionH2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-3xl md:text-4xl font-bold"
              >
                Ready to Start Your Journey?
              </MotionH2>
              <MotionP
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
              >
                Join thousands of job seekers who have found their dream jobs through our platform. 
                Get started in minutes with just your resume.
              </MotionP>
              <CtaButtons isAuthenticated={isAuthenticated} />
            </MotionDiv>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative border-t py-12 mt-20">
          <AnimatedGrid numSquares={15} maxOpacity={0.1} duration={6} repeatDelay={1} className="absolute inset-0 [mask-image:linear-gradient(to_bottom,white,transparent)]"/>
          <div className="relative container mx-auto px-4">
            <MotionDiv
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row justify-between items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <p className="text-lg font-bold text-primary font-[family-name:var(--font-display)]">
                  Job-यात्रा
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Job-यात्रा. All rights reserved.
              </p>
            </MotionDiv>
          </div>
        </footer>
      </div>
    </div>
  );
}
