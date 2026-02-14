import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import { Providers } from "./providers";
import { SessionRestore } from "@/components/auth/session-restore";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Greenwich University — Idea Management", template: "%s | Greenwich University" },
  description: "Greenwich University — Internal Idea Collection System. Submit, review, and manage ideas.",
};

/** Theme colors aligned with design-system primary (Greenwich purple/indigo). */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#28224B" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1535" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} font-sans antialiased`}>
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
