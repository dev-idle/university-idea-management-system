import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form";
import { BrandLogo } from "@/components/layout/brand-logo";
import { AUTH_INTERNAL_NOTE, ROUTES, SITE_NAME } from "@/config/constants";
import { BACK_LINK_CLASS, TR_AUTH_FORM_ENTRANCE } from "@/config/design";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: `Request a password reset link — ${SITE_NAME}`,
};

export default function ForgotPasswordPage() {
  return (
    <article className={cn("login-form-elegant flex w-full max-w-[28rem] min-w-0 flex-col gap-5 px-4 sm:gap-6 sm:px-0 md:gap-7", TR_AUTH_FORM_ENTRANCE)}>
      <div className="flex justify-start mt-2 -mb-2 md:mt-4 md:-ml-2">
        <Link href={ROUTES.LOGIN} className={cn(BACK_LINK_CLASS, "pl-0 min-h-[2.75rem] items-center")} aria-label="Return to sign in page">
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to sign in
        </Link>
      </div>
      <header className="flex flex-col gap-3 text-center md:gap-3 md:text-left md:-ml-2">
        <div className="flex justify-center md:hidden">
          <BrandLogo className="h-14 sm:h-16" align="center" />
        </div>
        <h1 className="hidden font-sans text-[1.5rem] font-light tracking-[-0.02em] text-foreground sm:text-[1.75rem] md:block md:text-[2rem]">
          Forgot password?
        </h1>
        <p className="hidden text-[14px] leading-[1.65] text-muted-foreground/90 sm:block sm:text-[15px]">
          Enter your email to get a reset link.
        </p>
      </header>

      <div className="login-form-divider md:-ml-2">
        <ForgotPasswordForm />
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
