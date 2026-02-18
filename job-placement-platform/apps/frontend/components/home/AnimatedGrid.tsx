"use client"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
interface AnimatedGridProps {
    numSquares?: number;
    maxOpacity?: number;
    duration?: number;
    repeatDelay?: number;
    className?: string;
}
export default function AnimatedGrid({numSquares,maxOpacity,duration,repeatDelay,className}:AnimatedGridProps) {
    return (
        <AnimatedGridPattern
        numSquares={numSquares || 30}
        maxOpacity={maxOpacity || 0.4}
        duration={duration || 3}
        repeatDelay={repeatDelay || 1}
        className={className || "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"}
      />
    )
}