"use client"

import { useUser } from "@/store/user"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
    const {token,role,setRole} = useUser()
    const {data:session}=useSession()
    const router = useRouter()
    return (
        <div>
            <h1>{role==="RECRUITER"?"Recruiter Dashboard":"Candidate Dashboard"}</h1>
            <h2>{role==="RECRUITER"?"Welcome, Recruiter":"Welcome, Candidate"}</h2>
            {role=="RECRUITER"&&<button onClick={()=>router.push("/create-company")}>Post Job</button>}
        </div>
    )
}   