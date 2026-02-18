import type { Metadata } from "next";
import { LoginForm } from "@/components/features/auth/login-form";
import { LoginGate } from "@/components/features/auth/login-gate";
import { BrandLogo } from "@/components/layout/brand-logo";
import { TR_PAGE_FADE, POPUP_BG, POPUP_BORDER, POPUP_SHADOW, POPUP_ROUNDED_MODAL } from "@/config/design";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Greenwich University — Internal Idea Collection System",
};

const SYSTEM_NAME = "Internal Idea Collection System";
const INTERNAL_NOTE = "For authorised University members only.";

export default function LoginPage() {
  return (
    <main
      className={`login-page-bg flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:py-16 ${TR_PAGE_FADE}`}
      role="main"
    >
      <LoginGate>
        <article
          className={`relative w-full max-w-[28rem] overflow-hidden sm:max-w-[32rem] ${POPUP_BG} ${POPUP_BORDER} ${POPUP_ROUNDED_MODAL} ${POPUP_SHADOW}`}
          role="region"
          aria-label="Sign in"
        >
          <div className="absolute left-0 top-0 h-full w-[3px] bg-primary/40" aria-hidden />
          <div className="pl-5 pr-6 py-8 sm:pl-7 sm:pr-10 sm:py-10">
            <header className="flex flex-col items-center text-center">
              <BrandLogo className="h-14 sm:h-16" />
              <div className="mt-4 h-px w-8 bg-primary/30" aria-hidden />
              <p className="mt-3 text-sm text-muted-foreground/80">{SYSTEM_NAME}</p>
            </header>
            <div className="mt-8 sm:mt-10">
              <LoginForm />
            </div>
            <div className="my-8 h-px bg-border/40" aria-hidden />
            <p className="text-center text-xs text-muted-foreground/80" role="note">
              {INTERNAL_NOTE}
            </p>
          </div>
        </article>
      </LoginGate>
    </main>
  );
}
