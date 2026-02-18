"use client";
import { motion } from "framer-motion";
import { LucideIcon, ChevronDown } from "lucide-react";
import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-xl border bg-background/50 backdrop-blur-sm overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between hover:bg-accent/50 transition-colors"
      >
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Icon className="w-6 h-6" />
          {title}
        </h2>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      )}
    </motion.div>
  );
}

