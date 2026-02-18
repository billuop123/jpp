"use client";

import { motion } from "motion/react";

interface LoadingStepProps {
  message: string;
}

export default function LoadingStep({ message }: LoadingStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center space-y-4 py-8 flex-1 min-h-[60vh]"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-slate-600 border-t-transparent rounded-full"
      />
      <p className="text-lg text-gray-700 dark:text-gray-300">{message}</p>
    </motion.div>
  );
}