"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Briefcase, DollarSign, Calendar, Github, Linkedin, Globe } from "lucide-react";

interface UserProfile {
  name: string | null;
  email: string;
  userDetails?: {
    location?: string | null;
    experience?: number | null;
    expectedSalary?: number | null;
    availability?: string | null;
    skills?: string[];
    resumeLink?: string | null;
    linkedin?: string | null;
    github?: string | null;
    portfolio?: string | null;
  };
}

export default function UserProfileClient({ profile }: { profile: UserProfile }) {
  const resumeLink = profile.userDetails?.resumeLink;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{profile.name || "Anonymous User"}</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{profile.email}</span>
            </div>
          </CardHeader>
        </Card>

        {profile.userDetails && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.userDetails.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.userDetails.location}</span>
                  </div>
                )}
                {profile.userDetails.experience !== null && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.userDetails.experience} years of experience</span>
                  </div>
                )}
                {profile.userDetails.expectedSalary && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>Expected Salary: ${profile.userDetails.expectedSalary}</span>
                  </div>
                )}
                {profile.userDetails.availability && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Available: {profile.userDetails.availability}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {profile.userDetails.skills && profile.userDetails.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.userDetails.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Resume & Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {resumeLink && (
                  <Button
                    variant="outline"
                    onClick={async () => {
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
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Open Resume in Browser
                  </Button>
                )}
                {profile.userDetails.linkedin && (
                  <a href={profile.userDetails.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
                {profile.userDetails.github && (
                  <a href={profile.userDetails.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <Github className="h-4 w-4" />
                    <span>GitHub Profile</span>
                  </a>
                )}
                {profile.userDetails.portfolio && (
                  <a href={profile.userDetails.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <Globe className="h-4 w-4" />
                    <span>Portfolio</span>
                  </a>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
