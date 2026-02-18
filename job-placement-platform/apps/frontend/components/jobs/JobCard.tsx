"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { MapPin, Briefcase, Calendar, Building2, ArrowRight } from "lucide-react"
import MotionDiv from "@/components/home/MotionDiv"
import { cn } from "@/scripts/lib/utils"

import { type JobListItem } from "./types"

interface JobCardProps {
    job: JobListItem
    index: number
    formatDate: (dateString: string) => string
}

export default function JobCard({ job, index, formatDate }: JobCardProps) {
    return (
        <MotionDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Link href={`/jobs/${job.id}`}>
                <div className={cn(
                    "group relative rounded-xl border bg-background/50 backdrop-blur-sm",
                    "hover:border-primary/50 hover:shadow-lg transition-all duration-300",
                    "p-6 cursor-pointer flex items-center justify-between gap-6",
                    "flex-col sm:flex-row"
                )}>
                    <div className="flex-1 w-full sm:w-auto space-y-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-sm text-muted-foreground font-medium">
                                        {job.company.name}
                                    </span>
                                    {job.isfeatured && (
                                        <Badge className="bg-primary text-primary-foreground flex-shrink-0">
                                            Featured
                                        </Badge>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                                    {job.title}
                                </h3>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span>{job.isRemote ? 'Remote' : job.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 flex-shrink-0" />
                                <span className="capitalize">{job.jobtype.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>Deadline: {formatDate(job.deadline)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm text-muted-foreground hidden sm:inline">
                            View Details
                        </span>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                </div>
            </Link>
        </MotionDiv>
    )
}

