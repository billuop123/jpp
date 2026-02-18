export type Step = "upload" | "parsing" | "extracting" | "review" | "saving" | "success";

export interface ExtractedData {
  Name?: string;
  Experience?: number | string;
  Skills?: string;
  Location?: string;
  LinkedIn?: string;
  Portfolio?: string;
  Github?: string;
  ExpectedSalary?: number | string;
  Availability?: string;
}

export interface UserDetailsResponse {
  resumeLink?: string | null;
  experience?: number | null;
  location?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  github?: string | null;
  expectedSalary?: number | null;
  availability?: string | null;
  skills?: string[] | null;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

