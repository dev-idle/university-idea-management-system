import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import { LoadingState } from "@/components/ui/loading-state";
import { Providers } from "./providers";
import { SessionRestore } from "@/components/auth/session-restore";
import { DEFAULT_PAGE_TITLE, PAGE_TITLE_TEMPLATE, SITE_NAME } from "@/config/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: DEFAULT_PAGE_TITLE, template: PAGE_TITLE_TEMPLATE },
  description: `${SITE_NAME} — Internal Idea Collection System. Submit, review, and manage ideas.`,
};

/** Theme colors aligned with design-system primary (Greenwich purple/indigo). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
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
          <Suspense fallback={<LoadingState fullScreen />}>
            <SessionRestore>{children}</SessionRestore>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
