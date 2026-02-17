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
import { LOADING_SPINNER_ON_PRIMARY_CLASS } from "@/config/design";
import {
  FORM_DIALOG_INPUT_CLASS,
  FORM_DIALOG_LABEL_CLASS,
  FORM_DIALOG_FIELD_WRAPPER_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_ERROR_BLOCK_CLASS,
} from "@/components/features/admin/constants";
import { ERROR_FALLBACK_FORM } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton({ pending, ariaDescribedBy }: { pending: boolean; ariaDescribedBy?: string }) {
  return (
    <Button
      type="submit"
      className="h-11 w-full rounded-lg font-semibold shadow-[var(--shadow-card-subtle)] transition-all duration-200 hover:bg-primary/95"
      disabled={pending}
      aria-busy={pending}
      aria-live="polite"
      aria-describedby={ariaDescribedBy}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span
            className={LOADING_SPINNER_ON_PRIMARY_CLASS}
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
        setError("root", { message: ERROR_FALLBACK_FORM.loginInvalid });
        return;
      }
      router.replace(entry);
      return;
    }
    setError("root", { message: ERROR_FALLBACK_FORM.loginInvalid });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
      aria-label="Sign in"
    >
      <div className="flex flex-col gap-6 rounded-xl border border-border/40 bg-muted/[0.03] px-5 py-5 sm:px-6 sm:py-6">
        <div className="space-y-6">
          <div className={FORM_DIALOG_FIELD_WRAPPER_CLASS}>
            <Label htmlFor="login-email" className={FORM_DIALOG_LABEL_CLASS}>
              Email
            </Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="name@gre.ac.uk"
              className={FORM_DIALOG_INPUT_CLASS}
              aria-invalid={!!errors.email}
              aria-describedby={
                errors.email ? "login-email-error" : undefined
              }
              {...register("email")}
            />
            {errors.email && !errors.root && (
              <p id="login-email-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className={FORM_DIALOG_FIELD_WRAPPER_CLASS}>
            <Label htmlFor="login-password" className={FORM_DIALOG_LABEL_CLASS}>
              Password
            </Label>
            <div className="relative group/field">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`${FORM_DIALOG_INPUT_CLASS} pr-11`}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "login-password-error" : undefined
                }
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-1 top-1/2 size-8 -translate-y-1/2 rounded-lg text-muted-foreground/80 transition-colors duration-200 hover:bg-primary/[0.06] hover:text-primary"
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
              <p id="login-password-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        {errors.root && (
          <div
            id="login-root-error"
            className={FORM_ERROR_BLOCK_CLASS}
            role="alert"
            aria-live="assertive"
          >
            {errors.root.message}
          </div>
        )}

        <div className="w-full">
          <SubmitButton pending={isSubmitting} ariaDescribedBy={errors.root ? "login-root-error" : undefined} />
        </div>
      </div>
    </form>
  );
}
