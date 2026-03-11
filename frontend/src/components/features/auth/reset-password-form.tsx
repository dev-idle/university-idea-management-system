"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { logoutAction, resetPasswordAction } from "@/actions/auth.actions";
import { ROUTES } from "@/config/constants";
import { useAuthStore } from "@/stores/auth.store";
import {
  resetPasswordBodySchema,
  type ResetPasswordBody,
} from "@/lib/schemas/auth.schema";
import { LOADING_SPINNER_ON_PRIMARY_CLASS } from "@/config/design";
import { cn } from "@/lib/utils";
import {
  FORM_DIALOG_FIELD_WRAPPER_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_ERROR_BLOCK_CLASS,
  PROFILE_INPUT_CLASS,
  PROFILE_INPUT_GROUP_HOVER_CLASS,
} from "@/components/features/admin/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ResetPasswordBody>({
    resolver: zodResolver(resetPasswordBodySchema),
    defaultValues: {
      token,
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = form;

  async function onSubmit(data: ResetPasswordBody) {
    const result = await resetPasswordAction({
      token: data.token,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
    if (result.ok) {
      await logoutAction();
      useAuthStore.getState().clearAuth();
      startTransition(() => router.replace(`${ROUTES.LOGIN}?reset=success`));
      return;
    }
    setError("root", { message: result.error });
  }

  const pending = isSubmitting || isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 sm:gap-6"
      noValidate
      aria-label="Set new password"
    >
      <input type="hidden" {...register("token")} />

      <div className="flex flex-col gap-3 sm:gap-4">
        <div className={FORM_DIALOG_FIELD_WRAPPER_CLASS}>
          <Label htmlFor="reset-new" className="sr-only">
            New password
          </Label>
          <div className="group/field relative" data-password-toggle>
            <Input
              id="reset-new"
              type={showNew ? "text" : "password"}
              autoComplete="new-password"
              placeholder="New password"
              className={cn(PROFILE_INPUT_CLASS, PROFILE_INPUT_GROUP_HOVER_CLASS, "h-11 min-h-[2.75rem] px-4 pr-14 text-base sm:pr-12 sm:text-[15px] touch-manipulation")}
              aria-invalid={!!errors.newPassword}
              aria-describedby={errors.newPassword ? "reset-new-error" : undefined}
              {...register("newPassword")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1.5 top-1/2 size-9 -translate-y-1/2 rounded-lg text-muted-foreground/80 transition-colors duration-200 hover:bg-primary/[0.06] hover:text-primary focus-visible:text-primary touch-manipulation"
              onClick={() => setShowNew((v) => !v)}
              aria-label={showNew ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
          {errors.newPassword && (
            <p id="reset-new-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className={FORM_DIALOG_FIELD_WRAPPER_CLASS}>
          <Label htmlFor="reset-confirm" className="sr-only">
            Confirm password
          </Label>
          <div className="group/field relative" data-password-toggle>
            <Input
              id="reset-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm new password"
              className={cn(PROFILE_INPUT_CLASS, PROFILE_INPUT_GROUP_HOVER_CLASS, "h-11 min-h-[2.75rem] px-4 pr-14 text-base sm:pr-12 sm:text-[15px] touch-manipulation")}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "reset-confirm-error" : undefined}
              {...register("confirmPassword")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1.5 top-1/2 size-9 -translate-y-1/2 rounded-lg text-muted-foreground/80 transition-colors duration-200 hover:bg-primary/[0.06] hover:text-primary focus-visible:text-primary touch-manipulation"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p id="reset-confirm-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      {errors.root && (
        <div id="reset-root-error" className={FORM_ERROR_BLOCK_CLASS} role="alert" aria-live="polite">
          {errors.root.message}
        </div>
      )}

      <Button
        type="submit"
        variant="default"
        className="h-11 min-h-[2.75rem] w-full rounded-xl text-base font-medium shadow-sm transition-all duration-200 hover:shadow touch-manipulation sm:text-[15px]"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <span className={LOADING_SPINNER_ON_PRIMARY_CLASS} aria-hidden />
            Resetting…
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <KeyRound className="size-4 shrink-0" aria-hidden />
            Reset password
          </span>
        )}
      </Button>
    </form>
  );
}
