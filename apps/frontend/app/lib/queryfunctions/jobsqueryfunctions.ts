import { BACKEND_URL } from "@/lib/config"

export const fetchUserDetails = async (token: string) => {
    const response = await fetch(`${BACKEND_URL}/user-details`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": token!
        }
    })

    const res = await response.json()
    if(res.message==="Invalid token"){
        throw new Error("Invalid token")
    }
    if (!response.ok) {
        throw new Error(res.message || "Failed to fetch user details")
    }
    return res
}


export const fetchResumeText = async (token: string) => {
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


export const fetchJobs=async (token:string,resumeQuery:any) => {
    const response = await fetch(`${BACKEND_URL}/jobs/search-jobs`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": token!
        },
        body: JSON.stringify({ query: resumeQuery })
    })

    const res = await response.json()

    if (!response.ok) throw new Error("Failed to fetch jobs")

    return res
}
export const fetchTopViewedJobs = async () => {
    const response = await fetch(`${BACKEND_URL}/jobs/top-viewed-jobs`);
    const res = await response.json();
    if (!response.ok) throw new Error("Failed to fetch top viewed jobs");
    return res;
}