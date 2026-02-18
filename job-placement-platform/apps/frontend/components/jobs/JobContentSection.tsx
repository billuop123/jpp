"use client";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, Briefcase, LucideIcon } from "lucide-react";

interface JobContentSectionProps {
  title: string;
  content: string;
  icon: LucideIcon;
  delay?: number;
}

export function JobContentSection({ 
  title, 
  content, 
  icon: Icon, 
  delay = 0.2 
}: JobContentSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-xl border bg-background/50 backdrop-blur-sm p-6 space-y-4"
    >
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Icon className="w-6 h-6" />
        {title}
      </h2>
      <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </motion.div>
  );
}

