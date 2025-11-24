"use client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Job } from "./types";
import { formatDate } from "./utils";
import { ApplyDialog } from "./ApplyDialog";

interface JobHeaderProps {
  job: Job;
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  applicationExists: boolean;
  applicationId: string | null;
}

export function JobHeader({ job, isDialogOpen, onDialogOpenChange, applicationExists, applicationId }: JobHeaderProps) {
  const router = useRouter();
  return (
    <section className="relative container mx-auto px-4 py-8 lg:py-12">
      <AnimatedGridPattern
        numSquares={20}
        maxOpacity={0.2}
        duration={4}
        repeatDelay={0.5}
        className="absolute inset-0 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
      />
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/jobs">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                {job.isfeatured && (
                  <Badge className="bg-primary text-primary-foreground">
                    Featured
                  </Badge>
                )}
                <Badge variant="outline" className="capitalize">
                  {job.experienceLevel || "Not specified"}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <span className="text-lg">Company Name</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{job.isRemote ? "Remote" : job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Deadline: {formatDate(job.deadline)}</span>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {!applicationExists ? (
                <ApplyDialog
                  job={job}
                  isOpen={isDialogOpen}
                  onOpenChange={onDialogOpenChange}
                />
              ) : (
                <Button
                  size="lg"
                  className="text-lg px-8"
                  onClick={() => {
                    if (applicationId) {
                      router.push(`/interview/${applicationId}`);
                    }
                  }}
                >
                  Interview Now
                </Button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

