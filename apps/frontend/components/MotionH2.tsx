"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type MotionH2Props = HTMLMotionProps<"h2"> & {
  children: ReactNode;
};

export default function MotionH2({ children, ...rest }: MotionH2Props) {
  return <motion.h2 {...rest}>{children}</motion.h2>;
}


