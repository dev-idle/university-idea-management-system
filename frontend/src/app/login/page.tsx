import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { LoginForm } from "@/components/features/auth/login-form";
import { LoginGate } from "@/components/features/auth/login-gate";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Greenwich University — Internal Idea Collection System",
};

const SYSTEM_NAME = "Internal Idea Collection System";
const INTERNAL_NOTE = "For authorised university members only.";

export default function LoginPage() {
  return (
    <main
      className="login-page-bg flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:py-16"
      role="main"
    >
      <LoginGate>
        <article
          className="relative w-full max-w-[28rem] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)] sm:max-w-[32rem]"
          role="region"
          aria-label="Sign in"
        >
          <div className="absolute left-0 top-0 h-full w-1 bg-primary/80 dark:bg-primary/70" aria-hidden />
          <div className="pl-5 pr-6 py-8 sm:pl-7 sm:pr-10 sm:py-12">
            <header className="flex flex-col items-center text-center">
              <div
                className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-primary-foreground/25 sm:size-16"
                aria-hidden
              >
                <GraduationCap className="size-7 sm:size-8" strokeWidth={1.5} stroke="currentColor" fill="none" />
              </div>
              <h1 className="mt-4 font-serif text-xl font-semibold tracking-tight text-primary sm:text-2xl">
                Greenwich University
              </h1>
              <Separator className="mx-auto mt-3 w-10 bg-primary/30" />
              <p className="mt-3 text-sm font-medium tracking-wide text-muted-foreground">{SYSTEM_NAME}</p>
            </header>
            <div className="mt-10 sm:mt-12">
              <LoginForm />
            </div>
            <Separator className="my-8 sm:my-10 bg-border/60" />
            <p className="text-center text-xs tracking-wide text-muted-foreground" role="note">
              {INTERNAL_NOTE}
            </p>
          </div>
        </article>
      </LoginGate>
    </main>
  );
}
