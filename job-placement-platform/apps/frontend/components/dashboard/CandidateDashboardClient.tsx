"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Briefcase, FileText, TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Application {
  id: string;
  job: {
    id: string;
    title: string;
    company: { name: string | null };
  } | null;
  applicationstatus: { name: string } | null;
  createdAt: string;
  relevanceScore: number | null;
}

interface CandidateDashboardClientProps {
  applications: Application[];
}

export function CandidateDashboardClient({ applications }: CandidateDashboardClientProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.applicationstatus?.name?.toLowerCase() === "pending").length,
    accepted: applications.filter(a => a.applicationstatus?.name?.toLowerCase() === "accepted").length,
    rejected: applications.filter(a => a.applicationstatus?.name?.toLowerCase() === "rejected").length,
  };

  const recentApplications = applications.slice(0, 5);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Candidate Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your applications and explore opportunities</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accepted}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => router.push("/jobs")}>
            <CardHeader>
              <Briefcase className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Browse Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Discover new opportunities</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(`/user-profile/${session?.user?.id}`)}>
            <CardHeader>
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View and manage your profile</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => router.push("/salary-predictor")}>
            <CardHeader>
              <TrendingUp className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Salary Predictor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Estimate your market value</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push("/candidate-applications")}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No applications yet</p>
                <Button className="mt-4" onClick={() => router.push("/jobs")}>Browse Jobs</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer" onClick={() => router.push(`/jobs/${app.job?.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                        {app.job?.company?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium">{app.job?.title || "Unknown Job"}</p>
                        <p className="text-sm text-muted-foreground">{app.job?.company?.name || "Unknown Company"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        app.applicationstatus?.name?.toLowerCase() === "accepted" ? "bg-green-500/10 text-green-600" :
                        app.applicationstatus?.name?.toLowerCase() === "rejected" ? "bg-red-500/10 text-red-600" :
                        "bg-yellow-500/10 text-yellow-600"
                      }`}>
                        {app.applicationstatus?.name || "Unknown"}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
