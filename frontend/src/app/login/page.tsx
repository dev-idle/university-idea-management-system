import type { Metadata } from "next";
import { LoginForm } from "@/components/features/auth/login-form";
import { LoginAcademicPanel } from "@/components/features/auth/login-academic-panel";
import { LoginGate } from "@/components/features/auth/login-gate";
import { BrandLogo } from "@/components/layout/brand-logo";
import { SITE_NAME } from "@/config/constants";
import { TR_PAGE_FADE } from "@/config/design";

export const metadata: Metadata = {
  title: "Sign In",
  description: `${SITE_NAME} — Internal Idea Collection System`,
};

const PORTAL_TITLE = "Sign in";
const SYSTEM_NAME = `${SITE_NAME} — Internal Idea Collection System`;
const SYSTEM_NAME_SHORT = "Internal Idea Collection System";
const INTERNAL_NOTE = "Access for authorised University members only.";

export default function LoginPage() {
  return (
    <main
      className={`login-page-split overflow-x-hidden overflow-y-auto sm:overflow-hidden sm:flex ${TR_PAGE_FADE}`}
      role="main"
    >
      <LoginGate>
        <LoginAcademicPanel />

        {/* Right: Form panel — responsive, touch-friendly */}
        <section
          className="login-form-panel relative flex min-h-screen min-h-[100dvh] flex-1 flex-col items-center justify-center md:flex-[0.65] lg:flex-[0.55] lg:min-w-[28rem] xl:min-w-[32rem]"
          role="region"
          aria-label="Sign in"
        >
          <article className="login-form-elegant flex w-full max-w-[28rem] min-w-0 flex-col gap-6 px-1 sm:px-0 sm:gap-7">
            <header className="flex flex-col gap-4 text-center md:text-left md:gap-3">
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

            <div className="login-form-divider">
              <LoginForm />
              <p
                className="mt-5 border-t border-border/30 pt-5 pb-1 text-center text-[11px] font-normal leading-relaxed tracking-wide text-muted-foreground/85 sm:mt-6 sm:pb-0 sm:text-[12px] md:mt-6"
                role="note"
              >
                {INTERNAL_NOTE}
              </p>
            </div>
          </article>
        </section>
      </LoginGate>
    </main>
  );
}
