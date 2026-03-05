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
const INTERNAL_NOTE = "Access for authorised University members only.";

export default function LoginPage() {
  return (
    <main
      className={`login-page-split min-h-screen overflow-hidden sm:flex ${TR_PAGE_FADE}`}
      role="main"
    >
      <LoginGate>
        <LoginAcademicPanel />

        {/* Right: Form panel — refined, comfortable */}
        <section
          className="login-form-panel relative flex min-h-screen flex-1 flex-col items-center justify-center px-8 py-14 sm:px-12 sm:py-16 md:flex-[0.65] lg:flex-[0.55] lg:min-w-[28rem] xl:min-w-[32rem]"
          role="region"
          aria-label="Sign in"
        >
          <article className="login-form-elegant w-full max-w-[28rem]">
            <header className="text-center md:text-left">
              <h1 className="font-sans text-[1.75rem] font-light tracking-tight text-foreground sm:text-[2rem]">
                {PORTAL_TITLE}
              </h1>
              <p className="mt-2.5 text-[15px] leading-[1.6] text-muted-foreground/95">
                {SYSTEM_NAME}
              </p>
            </header>

            <div className="login-form-divider">
              <LoginForm />
              <p
                className="mt-[1.75rem] border-t border-border/35 pt-5 text-center text-[12px] font-normal leading-relaxed tracking-wide text-muted-foreground/90"
                role="note"
              >
                {INTERNAL_NOTE}
              </p>
            </div>

            {/* Mobile: mini logo */}
            <div className="mt-10 flex justify-center md:hidden">
              <BrandLogo className="h-7 opacity-40" />
            </div>
          </article>
        </section>
      </LoginGate>
    </main>
  );
}
