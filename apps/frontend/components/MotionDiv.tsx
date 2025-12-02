"use client";

import { motion, type MotionProps } from "framer-motion";
import type { ReactNode } from "react";

type MotionDivProps = MotionProps & {
  children: ReactNode;
  className?: string;
};

export default function MotionDiv({
  children,
  className,
  initial,
  animate,
  transition,
  ...rest
}: MotionDivProps) {
  return (
    <motion.div
      initial={initial ?? { opacity: 0, y: 20 }}
      animate={animate ?? { opacity: 1, y: 0 }}
      transition={transition ?? { duration: 0.5 }}
      className={
        className ??
        "inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-muted/50 backdrop-blur-sm"
      }
      {...rest}
    >
      {children}
    </motion.div>
  );
}