"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { BACKEND_URL } from "@/scripts/lib/config";
import { useUser } from "@/store/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type UserDetailsResponse = {
  name: string | null;
  email: string | null;
  userDetails: {
    resumeLink: string | null;
    experience: string | null;
    location: string | null;
    linkedin: string | null;
    portfolio: string | null;
    github: string | null;
    expectedSalary: number | null;
    availability: string | null;
    skills: string[] | null;
  } | null;
};

export default function CandidateUserProfilePage() {
  const { applicationId, userId } =
    useParams<{ applicationId: string; userId: string }>();
  const { token } = useUser();

  const userDetailsQuery = useQuery<UserDetailsResponse>({
    queryKey: ["candidate-user-details", userId],
    enabled: !!userId && !!token,
    retry: false,
    queryFn: async () => {
      const response = await fetch(
        `${BACKEND_URL}/applications/user-details/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token!,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user details");
      }
      return data as UserDetailsResponse;
    },
  });

  const resumeLink = useMemo(() => {
    const link = userDetailsQuery.data?.userDetails?.resumeLink;
    if (!link) return null;
    if (link.trim().length === 0) return null;
    return link;
  }, [userDetailsQuery.data]);

  const skills =
    userDetailsQuery.data?.userDetails?.skills &&
    userDetailsQuery.data.userDetails.skills.length > 0
      ? userDetailsQuery.data.userDetails.skills
      : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Candidate profile
          </p>
          <h1 className="text-3xl font-semibold">
            Application {applicationId?.slice(0, 8)} – Candidate overview
          </h1>
          <p className="text-muted-foreground">
            Review this candidate&apos;s profile, experience, and links before
            deciding whether to grant access to their application.
          </p>
        </header>

        {userDetailsQuery.isLoading && (
          <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
            Loading candidate details...
          </div>
        )}

        {userDetailsQuery.isError && !userDetailsQuery.isLoading && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive text-base">
                Unable to load candidate
              </CardTitle>
              <CardDescription>
                There was a problem fetching this candidate&apos;s details. Please
                try again.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {userDetailsQuery.isSuccess && userDetailsQuery.data && (
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle>Profile overview</CardTitle>
                <CardDescription>
                  Basic information and preferences for this candidate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Candidate
                    </p>
                    <p className="text-lg font-semibold">
                      {userDetailsQuery.data.name || "Unnamed candidate"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {userDetailsQuery.data.email}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem
                    label="Location"
                    value={userDetailsQuery.data.userDetails?.location}
                  />
                  <DetailItem
                    label="Experience"
                    value={userDetailsQuery.data.userDetails?.experience}
                  />
                  <DetailItem
                    label="Expected salary"
                    value={
                      userDetailsQuery.data.userDetails?.expectedSalary != null
                        ? `${userDetailsQuery.data.userDetails.expectedSalary}`
                        : null
                    }
                  />
                  <DetailItem
                    label="Availability"
                    value={userDetailsQuery.data.userDetails?.availability}
                  />
                </div>

                {skills && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-muted px-2 py-1 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!resumeLink) return;
                      try {
                        const res = await fetch(resumeLink);
                        const blob = await res.blob();
                        const url = URL.createObjectURL(
                          new Blob([blob], { type: "application/pdf" })
                        );
                        window.open(url, "_blank", "noopener,noreferrer");
                      } catch (e) {
                        console.error("Failed to open resume", e);
                      }
                    }}
                    disabled={!resumeLink}
                  >
                    {resumeLink
                      ? "Open resume in browser"
                      : "Resume not available"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Links</CardTitle>
                <CardDescription>
                  External profiles and portfolio to learn more about this
                  candidate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <LinkItem
                  label="LinkedIn"
                  href={userDetailsQuery.data.userDetails?.linkedin}
                />
                <LinkItem
                  label="GitHub"
                  href={userDetailsQuery.data.userDetails?.github}
                />
                <LinkItem
                  label="Portfolio"
                  href={userDetailsQuery.data.userDetails?.portfolio}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-lg border bg-muted/40 px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium">
        {value && value.trim().length > 0 ? value : "—"}
      </p>
    </div>
  );
}

function LinkItem({
  label,
  href,
}: {
  label: string;
  href: string | null | undefined;
}) {
  const hasLink = href && href.trim().length > 0;

  if (!hasLink) {
    return (
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">Not provided</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-medium underline underline-offset-2"
      >
        Open
      </a>
    </div>
  );
}


