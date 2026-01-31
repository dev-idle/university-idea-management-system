import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/features/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to University Idea Management",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use your university credentials.
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="underline hover:text-foreground">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
