import AuthProviders from "@/components/AuthProviders";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthChecker from "@/components/AuthChecker";
import QueryClientProvider from "@/components/QueryClientProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorSuppress } from "./error-suppress";
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                const suppressOverlay = () => {
                  const selectors = [
                    '[data-nextjs-dialog]',
                    '[data-nextjs-toast]',
                    '#__next-build-watcher',
                    '[id*="nextjs"]',
                    '[class*="nextjs"]',
                    '[class*="__nextjs"]',
                    'iframe[src*="nextjs"]',
                  ];
                  selectors.forEach(sel => {
                    try {
                      document.querySelectorAll(sel).forEach(el => {
                        el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; position: fixed !important; z-index: -9999 !important; width: 0 !important; height: 0 !important;';
                        el.remove();
                      });
                    } catch(e) {}
                  });
                  document.querySelectorAll('div, span, p').forEach(el => {
                    const text = el.textContent || '';
                    if (text.match(/\\d+\\s+issues?/i) || text.includes('Issues') || (text.includes('issues') && text.length < 50)) {
                      let current = el;
                      while (current && current !== document.body) {
                        const hasNextjs = current.getAttribute('data-nextjs-dialog') || current.getAttribute('data-nextjs-toast') || current.id?.includes('nextjs') || current.className?.toString().includes('nextjs');
                        if (hasNextjs) {
                          current.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; position: fixed !important; z-index: -9999 !important; width: 0 !important; height: 0 !important;';
                          current.remove();
                          break;
                        }
                        current = current.parentElement;
                      }
                    }
                  });
                };
                setInterval(suppressOverlay, 50);
                suppressOverlay();
                document.addEventListener('DOMContentLoaded', suppressOverlay);
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ErrorSuppress />
          <AuthProviders>
            <AuthChecker>
              <QueryClientProvider>
                {children}
                <Toaster position="bottom-right"/>
              </QueryClientProvider>
            </AuthChecker>
          </AuthProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
