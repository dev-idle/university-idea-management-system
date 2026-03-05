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
  FORM_DIALOG_FIELD_WRAPPER_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_ERROR_BLOCK_CLASS,
  PROFILE_INPUT_CLASS,
  PROFILE_INPUT_GROUP_HOVER_CLASS,
} from "@/components/features/admin/constants";
import { ERROR_FALLBACK_FORM } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton({ pending, ariaDescribedBy }: { pending: boolean; ariaDescribedBy?: string }) {
  return (
    <Button
      type="submit"
      variant="default"
      className="h-11 min-h-[2.75rem] w-full rounded-xl text-base font-medium shadow-sm transition-all duration-200 hover:shadow touch-manipulation sm:text-[15px]"
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
      className="flex flex-col gap-5 sm:gap-6"
      noValidate
      aria-label="Sign in"
    >
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className={FORM_DIALOG_FIELD_WRAPPER_CLASS}>
          <Label htmlFor="login-email" className="sr-only">
            Email
          </Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="name@gre.ac.uk"
            className={cn(PROFILE_INPUT_CLASS, "h-11 min-h-[2.75rem] px-4 text-base sm:text-[15px] touch-manipulation")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && !errors.root && (
            <p id="login-email-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className={FORM_DIALOG_FIELD_WRAPPER_CLASS}>
          <Label htmlFor="login-password" className="sr-only">
            Password
          </Label>
          <div className="group/field relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              className={cn(PROFILE_INPUT_CLASS, PROFILE_INPUT_GROUP_HOVER_CLASS, "h-11 min-h-[2.75rem] px-4 pr-14 text-base sm:pr-12 sm:text-[15px] touch-manipulation")}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "login-password-error" : undefined}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-1.5 top-1/2 size-10 min-w-[2.75rem] min-h-[2.75rem] -translate-y-1/2 rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-primary/[0.06] hover:text-primary focus-visible:text-primary touch-manipulation sm:size-9"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="size-4 shrink-0 text-current" aria-hidden />
              ) : (
                <Eye className="size-4 shrink-0 text-current" aria-hidden />
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

      <SubmitButton pending={isSubmitting} ariaDescribedBy={errors.root ? "login-root-error" : undefined} />
    </form>
  );
}
