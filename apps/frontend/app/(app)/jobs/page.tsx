"use client"
import { fetchJobs, fetchResumeText, fetchTopViewedJobs, fetchUserDetails } from "@/app/lib/queryfunctions/jobsqueryfunctions"
import LoadingStep from "@/components/LoadingStep"
import { useUser } from "@/store/user"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { MapPin, Briefcase, Calendar, Building2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BACKEND_URL } from "@/lib/config"

interface Job {
    id: string
    title: string
    location: string
    isRemote: boolean
    isfeatured: boolean
    deadline: string
    createdAt: string
    company: {
        name: string
        logo: string
    }
    jobtype: {
        name: string
    }
}

interface JobsResponse {
    jobs?: Job[];
}

export default function JobsPage() {
    const { token,role } = useUser()
    const router = useRouter()
    const [jobSource, setJobSource] = useState<"top" | "semantic">("top")
    const canFetchUser = !!token && role==="CANDIDATE"

    
    const userQuery = useQuery({
        queryKey: ['user-details'],
        enabled: canFetchUser,
        retry:false,
        queryFn: () => fetchUserDetails(token as string),
    })
    useEffect(() => {
        if (userQuery.isError) {
            if(userQuery.error.message === "Invalid token") {
                toast.error("Invalid token, please sign in again")
                router.replace("/api/auth/signin")
            }
            if(userQuery.error.message==="User details not found"&&role==="CANDIDATE"){
                toast.error(userQuery.error.message || "Failed to fetch user details")
                router.replace("/user-details")
            }
        }
    }, [userQuery.isError, router])
    useEffect(() => {
        if (userQuery.data && !userQuery.data.resumeLink && role==="CANDIDATE") {
            toast.error("Please upload your resume to view jobs")
            router.replace("/user-details")
        }
    }, [userQuery.data, router])
    const topViewedJobsQuery=useQuery({
        queryKey: ['top-viewed-jobs'],
        retry:false,
        queryFn: () => fetchTopViewedJobs(),
    })
    useEffect(() => {
        if (topViewedJobsQuery.isError) {
            toast.error(topViewedJobsQuery.error.message || "Failed to fetch top viewed jobs")
        }
    }, [topViewedJobsQuery.isError])
    const canFetchResume = canFetchUser && !!userQuery.data?.resumeLink
    const resumeQuery = useQuery({
        queryKey: ['resume-text'],
        enabled: canFetchResume,
        retry:false,
        queryFn: () => fetchResumeText(token as string)
    })
    useEffect(() => {
        if (resumeQuery.isError) {
            toast.error(resumeQuery.error.message || "Failed to fetch resume text")
            router.replace("/user-details")
        }
    }, [resumeQuery.isError, router])
    const jobsQuery = useQuery<JobsResponse>({
        queryKey: ['jobs'],
        retry:false,
        enabled: canFetchResume && !!resumeQuery.data,
        queryFn: () => fetchJobs(token as string, resumeQuery.data.text as any)
    })
    useEffect(() => {
        if (jobsQuery.isError) {
            toast.error(jobsQuery.error.message || "Failed to fetch jobs")
            router.replace("/")
        }
    }, [jobsQuery.isError, router])
    const topViewedJobs: Job[] = topViewedJobsQuery.data?.jobs || []
    const canUseSemantic = !!resumeQuery.data && role==="CANDIDATE" && !!userQuery.data?.resumeLink
    useEffect(() => {
        if (canUseSemantic) {
            setJobSource("semantic")
        } else {
            setJobSource("top")
        }
    }, [canUseSemantic])

    if (topViewedJobsQuery.isPending) {
        return (
            <div className="min-h-[calc(100vh-8rem)] flex flex-col">
                <LoadingStep message="Loading top viewed jobs..." />
            </div>
        )
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        })
    }

    if (canFetchUser && userQuery.isPending) {
        return (
            <div className="min-h-[calc(100vh-8rem)] flex flex-col">
                <LoadingStep message="Checking user profile..." />
            </div>
        )
    }

    if (userQuery.data && !userQuery.data.resumeLink) {
        return (
            <div className="min-h-[calc(100vh-8rem)] flex flex-col">
                <LoadingStep message="Redirecting to resume upload..." />
            </div>
        )
    }

    if (canFetchResume && resumeQuery.isPending) {
        return (
            <div className="min-h-[calc(100vh-8rem)] flex flex-col">
                <LoadingStep message="Extracting resume text..." />
            </div>
        )
    }

    if (jobSource === "semantic" && jobsQuery.isPending) {
        return (
            <div className="min-h-[calc(100vh-8rem)] flex flex-col">
                <LoadingStep message="Loading jobs..." />
            </div>
        )
    }

    if (jobSource === "semantic" && !resumeQuery.data) {
        return (
            <div className="min-h-[calc(100vh-8rem)] flex flex-col">
                <LoadingStep message="No resume data available..." />
            </div>
        )
    }

    const semanticJobs: Job[] = jobsQuery.data?.jobs || []
    const displayJobs = jobSource === "semantic" ? semanticJobs : topViewedJobs
    const showSourceSelector = canUseSemantic && topViewedJobs.length > 0
    
    return (
        <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
            <AnimatedGridPattern
                numSquares={30}
                maxOpacity={0.4}
                duration={3}
                repeatDelay={1}
                className="[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
            />
            <div className="relative z-10">
                {/* Header Section */}
                <section className="relative container mx-auto px-4 py-12 lg:py-20">
                    <AnimatedGridPattern
                        numSquares={20}
                        maxOpacity={0.2}
                        duration={4}
                        repeatDelay={0.5}
                        className="absolute inset-0 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
                    />
                    <div className="relative max-w-4xl mx-auto text-center space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-muted/50 backdrop-blur-sm"
                        >
                            <Briefcase className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">AI-Matched Opportunities</span>
                        </motion.div>
                        
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                        >
                            Your Job Matches
                        </motion.h1>
                        
                        {showSourceSelector && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="flex items-center justify-center gap-3 text-sm text-muted-foreground"
                            >
                                <span>View:</span>
                                <select
                                    value={jobSource}
                                    onChange={(e) => setJobSource(e.target.value as "top" | "semantic")}
                                    className="rounded-md border border-input bg-background px-3 py-1 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                    <option value="semantic">AI Matched Jobs</option>
                                    <option value="top">Top Viewed Jobs</option>
                                </select>
                            </motion.div>
                        )}

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg text-muted-foreground max-w-2xl mx-auto"
                        >
                            {displayJobs.length > 0 
                                ? `Showing ${jobSource === "semantic" ? "AI-matched" : "top viewed"} jobs (${displayJobs.length})`
                                : `No ${jobSource === "semantic" ? "AI-matched" : "top viewed"} jobs available`}
                        </motion.p>
                    </div>
                </section>

                {/* Jobs Grid */}
                <section className="relative container mx-auto px-4 pb-20">
                    <AnimatedGridPattern
                        numSquares={25}
                        maxOpacity={0.15}
                        duration={5}
                        repeatDelay={0.8}
                        className="absolute inset-0 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
                    />
                    <div className="relative">
                        {displayJobs.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-20"
                            >
                                <p className="text-muted-foreground text-lg">
                                    No jobs found. Check back later for new opportunities!
                                </p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayJobs.map((job, index) => (
                                    <motion.div
                                        key={job.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                        <Link href={`/jobs/${job.id}`}>
                                            <div className={cn(
                                                "group relative h-full rounded-xl border bg-background/50 backdrop-blur-sm",
                                                "hover:border-primary/50 hover:shadow-lg transition-all duration-300",
                                                "p-6 space-y-4 cursor-pointer"
                                            )}>
                                                {job.isfeatured && (
                                                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                                                        Featured
                                                    </Badge>
                                                )}
                                                
                                                <div className="space-y-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                                                <span className="text-sm text-muted-foreground font-medium">
                                                                    {job.company.name}
                                                                </span>
                                                            </div>
                                                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                                                {job.title}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{job.isRemote ? 'Remote' : job.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Briefcase className="w-4 h-4" />
                                                            <span className="capitalize">{job.jobtype.name}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>Deadline: {formatDate(job.deadline)}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">
                                                        View Details
                                                    </span>
                                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}
