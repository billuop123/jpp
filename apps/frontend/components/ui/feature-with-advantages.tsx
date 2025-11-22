import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function Feature() {
  return (
    <div className="w-full py-20 lg:py-40" id="features">
      <div className="container mx-auto px-4">
        <div className="flex gap-4 py-20 lg:py-40 flex-col items-start">
          <div>
            <Badge>Platform Features</Badge>
          </div>
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular">
              Find Your Dream Job with AI-Powered Matching
            </h2>
            <p className="text-lg max-w-xl lg:max-w-xl leading-relaxed tracking-tight text-muted-foreground">
              Our intelligent platform uses advanced AI to match your skills and experience with the perfect job opportunities.
            </p>
          </div>
          <div className="flex gap-10 pt-12 flex-col w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="flex flex-row gap-6 w-full items-start">
                <Check className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">AI-Powered Matching</p>
                  <p className="text-muted-foreground text-sm">
                    Advanced algorithms analyze your resume and match you with the most relevant job opportunities.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Resume Parsing</p>
                  <p className="text-muted-foreground text-sm">
                    Upload your resume and let our AI extract all your skills, experience, and qualifications automatically.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Smart Job Search</p>
                  <p className="text-muted-foreground text-sm">
                    Search through thousands of job listings with intelligent filters and personalized recommendations.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 w-full items-start">
                <Check className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Profile Management</p>
                  <p className="text-muted-foreground text-sm">
                    Keep your profile up-to-date with skills, experience, and portfolio links all in one place.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Real-time Updates</p>
                  <p className="text-muted-foreground text-sm">
                    Get notified instantly when new jobs matching your profile are posted.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Secure & Private</p>
                  <p className="text-muted-foreground text-sm">
                    Your data is encrypted and secure. Control who sees your profile and information.
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
