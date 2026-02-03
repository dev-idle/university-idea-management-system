"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES, getEntryRouteForRoles } from "@/config/constants";
import { loginBodySchema, type LoginBody } from "@/lib/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GENERIC_ERROR = "Invalid credentials";

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button
      type="submit"
      className="h-11 w-full font-medium"
      disabled={pending}
      aria-busy={pending}
      aria-live="polite"
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span
            className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"
            aria-hidden
          />
          Signing in…
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          <LogIn className="size-4" aria-hidden />
          Sign in
        </span>
      )}
    </Button>
  );
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginBody>({
    resolver: zodResolver(loginBodySchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginBody) {
    const result = await login(data.email, data.password);
    if (result.ok) {
      const user = useAuthStore.getState().user;
      const roles = user?.roles ?? [];
      const entry = getEntryRouteForRoles(roles);
      if (entry === ROUTES.LOGIN) {
        setError("root", { message: GENERIC_ERROR });
        return;
      }
      router.replace(entry);
      return;
    }
    setError("root", { message: GENERIC_ERROR });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-0"
      noValidate
      aria-label="Sign in"
    >
      <div className="flex flex-col rounded-xl border border-border/60 bg-muted/20 px-5 py-5 dark:bg-muted/10 sm:px-6 sm:py-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-foreground">
              Email
            </Label>
            <p id="login-email-hint" className="text-xs text-muted-foreground">
              University email address
            </p>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="name@gre.ac.uk"
              className="h-11"
              aria-invalid={!!errors.email}
              aria-describedby={
                errors.email ? "login-email-error" : "login-email-hint"
              }
              {...register("email")}
            />
            {errors.email && !errors.root && (
              <p
                id="login-email-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-foreground">
              Password
            </Label>
            <p id="login-password-hint" className="text-xs text-muted-foreground">
              Your account password
            </p>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-11 pr-11"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "login-password-error" : "login-password-hint"
                }
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:bg-primary/10 focus-visible:text-primary focus-visible:ring-ring/50 dark:hover:bg-primary/20 dark:focus-visible:bg-primary/20"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </Button>
            </div>
            {errors.password && !errors.root && (
              <p
                id="login-password-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        {errors.root && (
          <div
            className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
            role="alert"
            aria-live="assertive"
          >
            {errors.root.message}
          </div>
        )}

        <div className="mt-6 w-full">
          <SubmitButton pending={isSubmitting} />
        </div>
      </div>
    </form>
  );
}
