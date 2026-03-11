import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/features/auth/login-form";
import { ResetSuccessBanner } from "@/components/features/auth/reset-success-banner";
import { BrandLogo } from "@/components/layout/brand-logo";
import { AUTH_INTERNAL_NOTE, SITE_NAME } from "@/config/constants";
import { TR_AUTH_FORM_ENTRANCE } from "@/config/design";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sign In",
  description: `${SITE_NAME} — Internal Idea Collection System`,
};

const PORTAL_TITLE = "Sign in";
const SYSTEM_NAME = `${SITE_NAME} — Internal Idea Collection System`;
const SYSTEM_NAME_SHORT = "Internal Idea Collection System";

export default function LoginPage() {
  return (
    <article className={cn("login-form-elegant flex w-full max-w-[28rem] min-w-0 flex-col gap-5 px-4 sm:gap-6 sm:px-0 md:gap-7", TR_AUTH_FORM_ENTRANCE)}>
      <header className="flex flex-col gap-3 text-center md:gap-3 md:text-left md:-ml-2">
        <div className="flex justify-center md:hidden">
          <BrandLogo className="h-14 sm:h-16" align="center" />
        </div>
        <h1 className="hidden font-sans text-[1.5rem] font-light tracking-[-0.02em] text-foreground sm:text-[1.75rem] md:block md:text-[2rem]">
          {PORTAL_TITLE}
        </h1>
        <p className="text-[14px] leading-[1.65] text-muted-foreground/90 sm:text-[15px]">
          <span className="md:hidden">{SYSTEM_NAME_SHORT}</span>
          <span className="hidden md:inline">{SYSTEM_NAME}</span>
        </p>
      </header>

      <div className="login-form-divider md:-ml-2">
        <Suspense fallback={null}>
          <ResetSuccessBanner />
        </Suspense>
        <LoginForm />
        <p
          className="mt-4 border-t border-border/30 pt-4 pb-1 text-center text-[11px] font-normal leading-relaxed tracking-wide text-muted-foreground/85 sm:mt-5 sm:pt-5 sm:pb-0 sm:text-[12px] md:mt-6 md:pt-6"
          role="note"
        >
          {AUTH_INTERNAL_NOTE}
        </p>
      </div>
    </article>
  );
}
