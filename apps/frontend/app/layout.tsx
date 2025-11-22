import AuthProviders from "@/components/AuthProviders";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthChecker from "@/components/AuthChecker";
import QueryClientProvider from "@/components/QueryClientProvider";
import { Toaster } from "sonner";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Job Placement Platform",
  description: "Job Placement Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProviders>
          <AuthChecker>
            <QueryClientProvider>
              {children}
              <Toaster position="bottom-right"/>
            </QueryClientProvider>
          </AuthChecker>
        </AuthProviders>
      </body>
    </html>
  );
}
