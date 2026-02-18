export const BACKEND_URL = "http://localhost:3000";
/** Salary prediction FastAPI server */
export const SALARY_API_URL =
  process.env.NEXT_PUBLIC_SALARY_API_URL || "http://localhost:8000";

// Vapi / ElevenLabs voice configuration.
// Default female voice uses the existing ID; override via env if needed.
export const VAPI_FEMALE_VOICE_ID =
  process.env.NEXT_PUBLIC_VAPI_FEMALE_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
// Default male voice falls back to the same voice until you set NEXT_PUBLIC_VAPI_MALE_VOICE_ID
// to a male ElevenLabs voice ID from your account.
export const VAPI_MALE_VOICE_ID =
  process.env.NEXT_PUBLIC_VAPI_MALE_VOICE_ID || "W78pxv1enhu0qj6t6IaC";

export const STRIPE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
export const GITHUB_CLIENTID = process.env.GITHUB_CLIENTID || "";
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
export const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "";
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "";

