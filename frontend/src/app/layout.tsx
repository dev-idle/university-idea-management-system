import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Crimson_Pro, Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { SessionRestore } from "@/components/auth/session-restore";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const crimsonPro = Crimson_Pro({
  weight: ["500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-crimson-pro",
});

export const metadata: Metadata = {
  title: { default: "Greenwich University — Idea Management", template: "%s | Greenwich University" },
  description: "Greenwich University — Internal Idea Collection System. Submit, review, and manage ideas.",
};

/** Theme colors aligned with design-system primary (navy / deep blue). */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e2a4a" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1729" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${crimsonPro.variable}`}>
        <Providers>
          <Suspense
            fallback={
              <div className="grid min-h-screen place-items-center bg-background">
                <p className="text-sm text-muted-foreground">Loading…</p>
              </div>
            }
          >
            <SessionRestore>{children}</SessionRestore>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
