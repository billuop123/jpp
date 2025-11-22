"use client";

import { FloatingHeader } from "@/components/ui/floating-header";
import { Feature } from "@/components/ui/feature-with-advantages";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, Sparkles, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  useEffect(() => {
    const unauthorized = searchParams?.get("unauthorized");
    if (unauthorized === "admin") {
      toast.error("Access denied. Admin privileges required to access the admin dashboard.");
      // Clean up the URL by removing the query parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("unauthorized");
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.4}
        duration={3}
        repeatDelay={1}
        className="[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
      />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <FloatingHeader />
        </div>

        {/* Hero Section */}
        <section className="relative container mx-auto px-4 py-20 lg:py-32">
          <AnimatedGridPattern
            numSquares={20}
            maxOpacity={0.2}
            duration={4}
            repeatDelay={0.5}
            className="absolute inset-0 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
          />
          <div className="relative max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-muted/50 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Job Matching</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
            >
              Find Your Dream Job
              <span className="block text-primary mt-2">Faster Than Ever</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Upload your resume and let our AI match you with the perfect job opportunities. 
              Get personalized recommendations based on your skills, experience, and career goals.
            </motion.p>

            <motion.div
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
                    onClick={() => router.push('/jobs')}
                  >
                    Browse Jobs
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-lg px-8"
                    onClick={() => router.push('/user-details')}
                  >
                    Complete Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="text-lg px-8"
                    onClick={() => router.push('/api/auth/signin')}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-lg px-8"
                    onClick={() => router.push('/jobs')}
                  >
                    Browse Jobs
                  </Button>
                </>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16"
            >
              {[
                { value: "10K+", label: "Active Job Listings" },
                { value: "95%", label: "Match Accuracy" },
                { value: "50K+", label: "Happy Candidates" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative">
          <AnimatedGridPattern
            numSquares={25}
            maxOpacity={0.15}
            duration={5}
            repeatDelay={0.8}
            className="absolute inset-0 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
          />
          <div className="relative">
            <Feature />
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative container mx-auto px-4 py-20 lg:py-32" id="about">
          <AnimatedGridPattern
            numSquares={20}
            maxOpacity={0.2}
            duration={4}
            repeatDelay={0.5}
            className="absolute inset-0 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
          />
          <div className="relative max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border bg-gradient-to-br from-primary/10 to-primary/5 p-8 md:p-12 text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4"
              >
                <Target className="w-8 h-8 text-primary" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-3xl md:text-4xl font-bold"
              >
                Ready to Start Your Journey?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
              >
                Join thousands of job seekers who have found their dream jobs through our platform. 
                Get started in minutes with just your resume.
              </motion.p>
              <motion.div
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
                    onClick={() => router.push('/jobs')}
                  >
                    Explore Jobs
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    className="text-lg px-8"
                    onClick={() => router.push('/api/auth/signin')}
                  >
                    Get Started Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative border-t py-12 mt-20">
          <AnimatedGridPattern
            numSquares={15}
            maxOpacity={0.1}
            duration={6}
            repeatDelay={1}
            className="absolute inset-0 [mask-image:linear-gradient(to_bottom,white,transparent)]"
          />
          <div className="relative container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row justify-between items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <p className="font-mono text-lg font-bold">JobPlace</p>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} JobPlace. All rights reserved.
              </p>
            </motion.div>
          </div>
        </footer>
      </div>
    </div>
  );
}
