"use client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface JobSkillsProps {
  skills: string[];
  delay?: number;
}

export function JobSkills({ skills, delay = 0.6 }: JobSkillsProps) {
  if (!skills || skills.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-xl border bg-background/50 backdrop-blur-sm p-6 space-y-4"
    >
      <h2 className="text-2xl font-bold">Required Skills</h2>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <Badge key={index} variant="secondary">
            {skill}
          </Badge>
        ))}
      </div>
    </motion.div>
  );
}

