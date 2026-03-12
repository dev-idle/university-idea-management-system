import { type ReactNode } from "react";
import { LoginAcademicPanel } from "@/components/features/auth/login-academic-panel";
import { AuthFormWrapper } from "@/components/features/auth/auth-form-wrapper";

/**
 * Shared auth layout: left panel stays mounted, only right form changes.
 * Eliminates flicker when navigating between login, forgot-password, reset-password.
 * Note: TR_PAGE_FADE removed from main to avoid layout shift on mobile — its transform
 * breaks position:fixed for "Back to sign in" (fixed elements need no transform ancestor).
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main
      className="login-page-split overflow-x-hidden overflow-y-auto sm:overflow-hidden sm:flex"
      role="main"
    >
      <LoginAcademicPanel />
      <AuthFormWrapper>
        <section
          className="login-form-panel relative flex min-h-screen min-h-[100dvh] flex-1 flex-col items-center justify-center overflow-y-auto py-6 md:flex-[0.65] lg:flex-[0.55] lg:min-w-[28rem] lg:py-8 xl:min-w-[32rem]"
          role="region"
          aria-label="Authentication"
        >
          {children}
        </section>
      </AuthFormWrapper>
    </main>
  );
}
