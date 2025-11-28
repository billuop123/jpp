import Link from "next/link";

export default function AdminDashboard() {
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <Link href="/candidateadmin">Candidate Admin</Link>
            <Link href="/recruiteradmin">Recruiter Admin</Link>
        </div>
    )
}