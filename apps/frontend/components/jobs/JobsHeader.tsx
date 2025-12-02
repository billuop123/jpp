"use client"

import { Briefcase } from "lucide-react"
import MotionDiv from "@/components/home/MotionDiv"
import MotionH1 from "@/components/home/MotionH1"
import MotionP from "@/components/home/MotionP"
import AnimatedGrid from "@/components/home/AnimatedGrid"
import { JobSource } from "./hooks/useJobSource"

interface JobsHeaderProps {
    jobSource: JobSource
    displayJobsCount: number
    showSourceSelector: boolean
    onSourceChange: (source: JobSource) => void
}

export default function JobsHeader({
    jobSource,
    displayJobsCount,
    showSourceSelector,
    onSourceChange,
}: JobsHeaderProps) {
    return (
        <section className="relative container mx-auto px-4 py-12 lg:py-20">
            <AnimatedGrid
                numSquares={20}
                maxOpacity={0.2}
                duration={4}
                repeatDelay={0.5}
                className="absolute inset-0 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
            />
            <div className="relative max-w-4xl mx-auto text-center space-y-4">
                <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-muted/50 backdrop-blur-sm"
                >
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">AI-Matched Opportunities</span>
                </MotionDiv>

                <MotionH1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                >
                    Your Job Matches
                </MotionH1>

                {showSourceSelector && (
                    <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex items-center justify-center gap-3 text-sm text-muted-foreground"
                    >
                        <span>View:</span>
                        <select
                            value={jobSource}
                            onChange={(e) => onSourceChange(e.target.value as JobSource)}
                            className="rounded-md border border-input bg-background px-3 py-1 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <option value="semantic">AI Matched Jobs</option>
                            <option value="top">Top Viewed Jobs</option>
                        </select>
                    </MotionDiv>
                )}

                <MotionP
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg text-muted-foreground max-w-2xl mx-auto"
                >
                    {displayJobsCount > 0
                        ? `Showing ${jobSource === "semantic" ? "AI-matched" : "top viewed"} jobs (${displayJobsCount})`
                        : `No ${jobSource === "semantic" ? "AI-matched" : "top viewed"} jobs available`}
                </MotionP>
            </div>
        </section>
    )
}

