"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type MotionPProps = HTMLMotionProps<"p"> & {
  children: ReactNode;
};

export default function MotionP({ children, ...rest }: MotionPProps) {
  return <motion.p {...rest}>{children}</motion.p>;
}


