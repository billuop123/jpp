import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function Feature() {
  return (
    <div className="w-full py-20 lg:py-32" id="features">
      <div className="container mx-auto px-4">
        <div className="flex gap-4 py-10 lg:py-16 flex-col items-start">
          <div>
            <Badge>Job-यात्रा Features</Badge>
          </div>
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular">
              Everything you need for your job journey
            </h2>
            <p className="text-lg max-w-xl lg:max-w-xl leading-relaxed tracking-tight text-muted-foreground">
              Job-यात्रा combines AI-powered job matching, resume tailoring, and realistic mock
              interviews so candidates and recruiters can make better decisions, faster.
            </p>
          </div>
          <div className="flex gap-10 pt-12 flex-col w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="flex flex-row gap-6 w-full items-start">
                <Check className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">AI Job & Resume Matching</p>
                  <p className="text-muted-foreground text-sm">
                    Semantic search and AI ranking match your profile to the most relevant roles,
                    not just keyword hits.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">AI Resume Tailoring</p>
                  <p className="text-muted-foreground text-sm">
                    Tailor your resume to each job using AI that highlights the right skills,
                    experience, and achievements.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Mock Interview Coaching</p>
                  <p className="text-muted-foreground text-sm">
                    Practice with voice-based mock interviews and get per-answer feedback powered
                    by Gemini before the real call.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 w-full items-start">
                <Check className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Recruiter Workflows</p>
                  <p className="text-muted-foreground text-sm">
                    Recruiters get structured scoring, candidate shortlists, and rich application
                    views to move faster.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Deep Interview Insights</p>
                  <p className="text-muted-foreground text-sm">
                    Capture interview conversations and generate detailed analysis on skills,
                    communication, and fit.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Secure & Private</p>
                  <p className="text-muted-foreground text-sm">
                    Your data is encrypted and access-controlled, with clear boundaries between
                    real interviews and mock practice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Feature };
