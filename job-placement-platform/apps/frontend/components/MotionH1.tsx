"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type MotionH1Props = HTMLMotionProps<"h1"> & {
  children: ReactNode;
};

export default function MotionH1({ children, ...rest }: MotionH1Props) {
  return <motion.h1 {...rest}>{children}</motion.h1>;
}


