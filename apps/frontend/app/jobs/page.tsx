"use client"
import LoadingStep from "@/components/LoadingStep"
import { BACKEND_URL } from "@/config"
import { useUser } from "@/store/user"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function JobsPage() {
    const { token } = useUser()
    const router = useRouter()
    const userQuery = useQuery({
        queryKey: ['user-details'],
        enabled: !!token,
        queryFn: async () => {
            const response = await fetch(`${BACKEND_URL}/user-details`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token!
                }
            })

            const res = await response.json()

            if (response.status === 404 || !res.finished) {
                toast.error("Please complete your profile to view jobs")
                router.replace("/user-details")
                return null
            }

            if (!response.ok) {
                throw new Error(res.message || "Failed to fetch user details")
            }

            return res
        }
    })
    const resumeQuery = useQuery({
        queryKey: ['resume-text'],
        enabled: !!token && !!userQuery.data?.resumeLink,
        queryFn: async () => {
            const response = await fetch(`${BACKEND_URL}/user-details/parse-pdf`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token!
                },
            })

            const res = await response.json()

            if (!response.ok) throw new Error("Failed to extract resume text")

            return res
        }
    })

    const jobsQuery = useQuery({
        queryKey: ['jobs'],
        enabled: !!token && !!resumeQuery.data,
        queryFn: async () => {
            const response = await fetch(`${BACKEND_URL}/jobs/search-jobs`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token!
                },
                body: JSON.stringify({ query: resumeQuery.data?.text })
            })

            const res = await response.json()

            if (!response.ok) throw new Error("Failed to fetch jobs")

            return res
        }
    })
    if (userQuery.isPending) {
        return (
            <div className="min-h-[calc(100vh-8rem)] flex flex-col">
                <LoadingStep message="Checking user profile..." />
            </div>
        )
    }

    if (resumeQuery.isPending) {
        return (
            <div className="min-h-[calc(100vh-8rem)] flex flex-col">
                <LoadingStep message="Extracting resume text..." />
            </div>
        )
    }

    if (jobsQuery.isPending) {
        return (
            <div className="min-h-[calc(100vh-8rem)] flex flex-col">
                <LoadingStep message="Loading jobs..." />
            </div>
        )
    }

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">Resume Text</h1>
            <p>{resumeQuery.data?.text}</p>

            <h1 className="text-xl font-bold mt-8">Jobs</h1>
            <pre>{JSON.stringify(jobsQuery.data ?? {}, undefined, 2)}</pre>
        </div>
    )
}
