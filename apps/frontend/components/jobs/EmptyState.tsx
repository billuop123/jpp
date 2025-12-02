"use client"

import MotionDiv from "@/components/home/MotionDiv"

export default function EmptyState() {
    return (
        <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
        >
            <p className="text-muted-foreground text-lg">
                No jobs found. Check back later for new opportunities!
            </p>
        </MotionDiv>
    )
}

