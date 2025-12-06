"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ChartRadarDots } from "@/components/RadarCharts";
import { BACKEND_URL } from "@/scripts/lib/config";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UserApplicationDetails } from "../../types";

export default function RecruiterApplicationsPage() {
  const { jobId, userId } = useParams<{ jobId: string; userId: string }>();

  const applicationQuery = useQuery<UserApplicationDetails>({
    queryKey: ["user-application-details", jobId, userId],
    retry: false,
    enabled: !!jobId && !!userId,
    queryFn: async () => {
      const response = await fetch(
        `${BACKEND_URL}/applications/user-application-details/${jobId}/${userId}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user application details");
      }
      return data as UserApplicationDetails;
    },
  });

  const application = applicationQuery.data;
  const resumeLink =
    application?.user?.userDetails?.resumeLink &&
    application.user.userDetails.resumeLink.trim().length > 0
      ? application.user.userDetails.resumeLink
      : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Application Details
          </p>
          <h1 className="text-3xl font-semibold">
            {application?.user?.name || "Candidate"}&apos;s Interview Summary
          </h1>
          <p className="text-muted-foreground">
            Review this candidate&apos;s interview scores, AI-generated feedback, and
            open their resume directly in your browser.
          </p>
        </header>

        {applicationQuery.isLoading && (
          <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
            Loading application details...
          </div>
        )}

        {applicationQuery.isError && !applicationQuery.isLoading && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive text-base">
                Unable to load application
              </CardTitle>
              <CardDescription>
                There was a problem fetching this candidate&apos;s application. Please
                try again.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {application && (
          <>
            <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>
                    High-level view of this candidate&apos;s performance for job{" "}
                    <span className="font-mono text-xs">{jobId}</span>.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Candidate
                      </p>
                      <p className="text-lg font-semibold">
                        {application.user?.name || "Unnamed candidate"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {application.user?.email}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Total Relevance Score
                      </p>
                      <p className="text-3xl font-semibold">
                        {application.relevanceScore ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <ScoreItem
                      label="Technical"
                      value={application.technicalScore}
                    />
                    <ScoreItem
                      label="Communication"
                      value={application.communicationScore}
                    />
                    <ScoreItem
                      label="Problem solving"
                      value={application.problemSolvingScore}
                    />
                    <ScoreItem
                      label="Job relevance"
                      value={application.jobRelevanceScore}
                    />
                    <ScoreItem
                      label="Depth of knowledge"
                      value={application.depthOfKnowledgeScore}
                    />
                  </div>

                  <ApplicationCommentsSection application={application} />

                  <div className="flex flex-wrap gap-3">
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
                      {resumeLink ? "Open resume in browser" : "Resume not available"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <ChartRadarDots
                  scores={{
                    technicalScore: application.technicalScore,
                    communicationScore: application.communicationScore,
                    problemSolvingScore: application.problemSolvingScore,
                    jobRelevanceScore: application.jobRelevanceScore,
                    depthOfKnowledgeScore: application.depthOfKnowledgeScore,
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ScoreItem({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-lg border bg-muted/40 px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-lg font-semibold">{value ?? "—"}</p>
    </div>
  );
}

function ApplicationCommentsSection({
  application,
}: {
  application: UserApplicationDetails;
}) {
  const hasAnyComments =
    !!application.relevancecomment ||
    !!application.strengths ||
    !!application.weaknesses;

  const [openSections, setOpenSections] = useState({
    overall: true,
    strengths: false,
    weaknesses: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="mt-4 rounded-lg border bg-muted/30">
      <div className="border-b px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Interview comments
        </p>
      </div>
      <div className="px-3 py-2 space-y-2 text-sm">
        {application.relevancecomment && (
          <div className="rounded-md bg-background/60">
            <button
              type="button"
              onClick={() => toggleSection("overall")}
              className="flex w-full items-center justify-between px-2 py-2 text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Overall commentary
              </span>
              <span className="text-xs text-muted-foreground">
                {openSections.overall ? "Hide" : "Show"}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {openSections.overall && (
                <motion.div
                  key="overall"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="px-2 pb-2"
                >
                  <p className="whitespace-pre-line">
                    {application.relevancecomment}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {application.strengths && (
          <div className="rounded-md bg-background/60">
            <button
              type="button"
              onClick={() => toggleSection("strengths")}
              className="flex w-full items-center justify-between px-2 py-2 text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Strengths
              </span>
              <span className="text-xs text-muted-foreground">
                {openSections.strengths ? "Hide" : "Show"}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {openSections.strengths && (
                <motion.div
                  key="strengths"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="px-2 pb-2"
                >
                  <p className="whitespace-pre-line">
                    {application.strengths}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {application.weaknesses && (
          <div className="rounded-md bg-background/60">
            <button
              type="button"
              onClick={() => toggleSection("weaknesses")}
              className="flex w-full items-center justify-between px-2 py-2 text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                Weaknesses
              </span>
              <span className="text-xs text-muted-foreground">
                {openSections.weaknesses ? "Hide" : "Show"}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {openSections.weaknesses && (
                <motion.div
                  key="weaknesses"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="px-2 pb-2"
                >
                  <p className="whitespace-pre-line">
                    {application.weaknesses}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {!hasAnyComments && (
          <p className="text-muted-foreground text-xs">
            No comments were generated for this interview.
          </p>
        )}
      </div>
    </section>
  );
}