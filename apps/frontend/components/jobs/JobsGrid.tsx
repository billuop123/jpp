"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import AnimatedGrid from "@/components/home/AnimatedGrid"
import { type JobListItem } from "./types"
import EmptyState from "./EmptyState"
import { Building2, MapPin, Briefcase, Calendar, ArrowRight } from "lucide-react"

interface JobsGridProps {
    jobs: JobListItem[]
    formatDate: (dateString: string) => string
}

export default function JobsGrid({ jobs, formatDate }: JobsGridProps) {
    return (
        <section className="relative container mx-auto px-4 pb-20">
            <AnimatedGrid
                numSquares={25}
                maxOpacity={0.15}
                duration={5}
                repeatDelay={0.8}
                className="absolute inset-0 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
            />
            <div className="relative">
                {jobs.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="rounded-lg border bg-background/50 backdrop-blur-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Company</TableHead>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead className="w-[150px]">Location</TableHead>
                                    <TableHead className="w-[120px]">Type</TableHead>
                                    <TableHead className="w-[150px]">Deadline</TableHead>
                                    <TableHead className="w-[100px] text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobs.map((job) => (
                                    <TableRow
                                        key={job.id}
                                        className="group cursor-pointer hover:bg-muted/50 transition-colors"
                                    >
                                        <TableCell>
                                            <Link href={`/jobs/${job?.id}`} className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">{job.company.name}</span>
                                                {job.isfeatured && (
                                                    <Badge className="ml-2 bg-primary text-primary-foreground">
                                                        Featured
                                                    </Badge>
                                                )}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/jobs/${job.id}`}>
                                                <span className="font-semibold group-hover:text-primary transition-colors">
                                                    {job.title}
                                                </span>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <MapPin className="w-4 h-4" />
                                                <span>{job.isRemote ? 'Remote' : job.location}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Briefcase className="w-4 h-4" />
                                                <span className="capitalize">{job.jobtype.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(job.deadline)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/jobs/${job.id}`}>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all inline-block" />
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </section>
    )
}

