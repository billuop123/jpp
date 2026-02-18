import Link from "next/link";

export default function CandidateDashboard() {
  return (
    <div className="flex flex-col gap-4 justify-center items-center h-screen">
      <Link href="/jobs">Browse Jobs</Link>
      <Link href="/user-details">Edit User Details</Link>
      <Link href="/candidate-applications">View Applications</Link>
      <Link href="/salary-predictor">Salary Predictor</Link>
    </div>
  );
}