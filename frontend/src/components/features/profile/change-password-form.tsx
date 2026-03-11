"use client";

import type { ComponentProps } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { fetchWithAuth } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import {
  changePasswordBodySchema,
  type ChangePasswordBody,
} from "@/lib/schemas/profile.schema";
import { Button } from "@/components/ui/button";
import { LOADING_SPINNER_ON_PRIMARY_SM_CLASS } from "@/config/design";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  PROFILE_SECTION_CARD_CLASS,
  PROFILE_STAFF_SECTION_CARD_CLASS,
  PROFILE_SECTION_HEADER_CLASS,
  PROFILE_SECTION_TITLE_CLASS,
  PROFILE_HEADER_BUTTON_CLASS,
  PROFILE_LABEL_CLASS,
  PROFILE_INPUT_CLASS,
  PROFILE_INPUT_GROUP_HOVER_CLASS,
  PROFILE_FORM_FIELD_STACK,
  PROFILE_FORM_ITEM_CLASS,
  FORM_ERROR_BLOCK_CLASS,
} from "@/components/features/admin/constants";

import { ERROR_FALLBACK_FORM } from "@/lib/errors";

/** Wraps Input+toggle so FormControl can pass id to the Input for label association. */
function PasswordInputWithToggle({
  id,
  show,
  onToggle,
  ...inputProps
}: ComponentProps<typeof Input> & { show?: boolean; onToggle?: () => void }) {
  return (
    <div className="group/field relative" data-password-toggle>
      <Input id={id} {...inputProps} />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute right-1 top-1/2 size-8 -translate-y-1/2 rounded-lg text-muted-foreground/80 transition-colors duration-200 hover:bg-primary/[0.06] hover:text-primary"
        onClick={onToggle}
        aria-label={show ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {show ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </Button>
    </div>
  );
}

interface ChangePasswordFormProps {
  /** Staff layout: rounded-2xl card matching Ideas. */
  staffLayout?: boolean;
}

export function ChangePasswordForm({ staffLayout = false }: ChangePasswordFormProps = {}) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<ChangePasswordBody>({
    resolver: zodResolver(changePasswordBodySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const {
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = form;

  async function onSubmit(data: ChangePasswordBody) {
    try {
      await fetchWithAuth<{ message: string }>("me/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.me() });
      reset();
      form.setValue("currentPassword", "");
      form.setValue("newPassword", "");
      form.setValue("confirmNewPassword", "");
    } catch {
      setError("root", { message: ERROR_FALLBACK_FORM.updatePassword });
    }
  }

  return (
    <Card className={staffLayout ? PROFILE_STAFF_SECTION_CARD_CLASS : PROFILE_SECTION_CARD_CLASS}>
      <CardHeader className={PROFILE_SECTION_HEADER_CLASS}>
        <CardTitle className={PROFILE_SECTION_TITLE_CLASS}>
          <KeyRound className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          Change password
        </CardTitle>
        <CardAction className="hidden sm:flex">
          <Button
            form="change-password-form"
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className={PROFILE_HEADER_BUTTON_CLASS}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={LOADING_SPINNER_ON_PRIMARY_SM_CLASS}
                  aria-hidden
                />
                Updating…
              </span>
            ) : (
              "Update password"
            )}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-8 py-6">
        <Form {...form}>
          <form
            id="change-password-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className={PROFILE_FORM_FIELD_STACK}
            noValidate
            aria-label="Change password"
          >
            {errors.root && (
              <p
                className={FORM_ERROR_BLOCK_CLASS}
                role="alert"
                aria-live="polite"
              >
                {errors.root.message}
              </p>
            )}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem className={PROFILE_FORM_ITEM_CLASS}>
                  <FormLabel className={PROFILE_LABEL_CLASS}>
                    Current password
                  </FormLabel>
                  <FormControl>
                    <PasswordInputWithToggle
                      type={showCurrent ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={`${PROFILE_INPUT_CLASS} ${PROFILE_INPUT_GROUP_HOVER_CLASS} pr-11`}
                      aria-invalid={!!errors.currentPassword}
                      show={showCurrent}
                      onToggle={() => setShowCurrent((p) => !p)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className={PROFILE_FORM_ITEM_CLASS}>
                  <FormLabel className={PROFILE_LABEL_CLASS}>
                    New password
                  </FormLabel>
                  <FormControl>
                    <PasswordInputWithToggle
                      type={showNew ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className={`${PROFILE_INPUT_CLASS} ${PROFILE_INPUT_GROUP_HOVER_CLASS} pr-11`}
                      aria-invalid={!!errors.newPassword}
                      show={showNew}
                      onToggle={() => setShowNew((p) => !p)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
                <FormField
                  control={form.control}
                  name="confirmNewPassword"
                  render={({ field }) => (
                    <FormItem className={PROFILE_FORM_ITEM_CLASS}>
                      <FormLabel className={PROFILE_LABEL_CLASS}>
                        Confirm new password
                      </FormLabel>
                      <FormControl>
                        <PasswordInputWithToggle
                          type={showConfirm ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          className={`${PROFILE_INPUT_CLASS} ${PROFILE_INPUT_GROUP_HOVER_CLASS} pr-11`}
                          aria-invalid={!!errors.confirmNewPassword}
                          show={showConfirm}
                          onToggle={() => setShowConfirm((p) => !p)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            <div className="block sm:hidden">
              <Button
                form="change-password-form"
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="h-11 w-full rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-[var(--shadow-card-subtle)] transition-all duration-200 hover:bg-primary/95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <span
                      className={LOADING_SPINNER_ON_PRIMARY_SM_CLASS}
                      aria-hidden
                    />
                    Updating…
                  </span>
                ) : (
                  "Update password"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
