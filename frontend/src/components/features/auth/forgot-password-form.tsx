"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Mail } from "lucide-react";
import { forgotPasswordAction } from "@/actions/auth.actions";
import {
  forgotPasswordBodySchema,
  type ForgotPasswordBody,
} from "@/lib/schemas/auth.schema";
import { LOADING_SPINNER_ON_PRIMARY_CLASS } from "@/config/design";
import { cn } from "@/lib/utils";
import {
  FORM_DIALOG_FIELD_WRAPPER_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_ERROR_BLOCK_CLASS,
  FORM_SUCCESS_BLOCK_CLASS,
  PROFILE_INPUT_CLASS,
} from "@/components/features/admin/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordBody>({
    resolver: zodResolver(forgotPasswordBodySchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotPasswordBody) {
    const result = await forgotPasswordAction({ email: data.email });
    if (result.ok) {
      setError("root", {
        type: "success",
        message: result.data.message,
      });
      return;
    }
    setError("root", { message: result.error });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 sm:gap-6"
      noValidate
      aria-label="Request password reset"
    >
      <div className={FORM_DIALOG_FIELD_WRAPPER_CLASS}>
        <Label htmlFor="forgot-email" className="sr-only">
          Email
        </Label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          placeholder="name@gre.ac.uk"
          className={cn(PROFILE_INPUT_CLASS, "h-11 min-h-[2.75rem] px-4 text-base sm:text-[15px] touch-manipulation")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "forgot-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && !errors.root && (
          <p id="forgot-email-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {errors.root && (
        <div
          id="forgot-root-msg"
          className={cn(
            "flex items-center gap-3",
            errors.root.type === "success"
              ? FORM_SUCCESS_BLOCK_CLASS
              : FORM_ERROR_BLOCK_CLASS
          )}
          role="alert"
          aria-live="polite"
        >
          {errors.root.type === "success" && (
            <CheckCircle className="size-4 shrink-0" aria-hidden />
          )}
          <span>{errors.root.message}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="default"
        className="h-11 min-h-[2.75rem] w-full rounded-xl text-base font-medium shadow-sm transition-all duration-200 hover:shadow touch-manipulation sm:text-[15px]"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        aria-describedby={errors.root ? "forgot-root-msg" : undefined}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <span className={LOADING_SPINNER_ON_PRIMARY_CLASS} aria-hidden />
            Sending…
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <Mail className="size-4 shrink-0" aria-hidden />
            Send reset link
          </span>
        )}
      </Button>
    </form>
  );
}
