"use client";
import { motion } from "framer-motion";
import { JobOverview } from "./JobOverview";
import { ApplicationInfo } from "./ApplicationInfo";
import { ContactInfo } from "./ContactInfo";
import { Job } from "./types";

interface JobSidebarProps {
  job: Job;
}

export function JobSidebar({ job }: JobSidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="sticky top-8 space-y-6"
    >
      <JobOverview job={job} />
      <ApplicationInfo job={job} />
      <ContactInfo job={job} />
    </motion.div>
  );
}

