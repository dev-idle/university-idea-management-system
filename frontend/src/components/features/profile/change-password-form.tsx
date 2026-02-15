"use client";

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
  PROFILE_SECTION_HEADER_CLASS,
  PROFILE_SECTION_TITLE_CLASS,
  PROFILE_HEADER_BUTTON_CLASS,
  PROFILE_LABEL_CLASS,
  PROFILE_INPUT_CLASS,
  PROFILE_INPUT_GROUP_HOVER_CLASS,
  PROFILE_FORM_FIELD_STACK,
  PROFILE_FORM_ITEM_CLASS,
  PROFILE_PASSWORD_TOGGLE_CLASS,
  PROFILE_PASSWORD_FIELD_WRAPPER_CLASS,
  FORM_ERROR_BLOCK_CLASS,
} from "@/components/features/admin/constants";

import { ERROR_FALLBACK_FORM } from "@/lib/errors";

export function ChangePasswordForm() {
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
    <Card className={PROFILE_SECTION_CARD_CLASS}>
      <CardHeader className={PROFILE_SECTION_HEADER_CLASS}>
        <CardTitle className={PROFILE_SECTION_TITLE_CLASS}>
          <KeyRound className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          Change password
        </CardTitle>
        <CardAction>
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
                  className="size-3 animate-spin rounded-full border-2 border-primary border-t-transparent"
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
                    <div className={PROFILE_PASSWORD_FIELD_WRAPPER_CLASS}>
                      <Input
                        type={showCurrent ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className={`${PROFILE_INPUT_CLASS} ${PROFILE_INPUT_GROUP_HOVER_CLASS} pr-10`}
                        aria-invalid={!!errors.currentPassword}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={PROFILE_PASSWORD_TOGGLE_CLASS}
                        onClick={() => setShowCurrent((p) => !p)}
                        aria-label={
                          showCurrent ? "Hide password" : "Show password"
                        }
                      >
                        {showCurrent ? (
                          <EyeOff className="size-4" aria-hidden />
                        ) : (
                          <Eye className="size-4" aria-hidden />
                        )}
                      </Button>
                    </div>
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
                    <div className={PROFILE_PASSWORD_FIELD_WRAPPER_CLASS}>
                      <Input
                        type={showNew ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className={`${PROFILE_INPUT_CLASS} ${PROFILE_INPUT_GROUP_HOVER_CLASS} pr-10`}
                        aria-invalid={!!errors.newPassword}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={PROFILE_PASSWORD_TOGGLE_CLASS}
                        onClick={() => setShowNew((p) => !p)}
                        aria-label={
                          showNew ? "Hide password" : "Show password"
                        }
                      >
                        {showNew ? (
                          <EyeOff className="size-4" aria-hidden />
                        ) : (
                          <Eye className="size-4" aria-hidden />
                        )}
                      </Button>
                    </div>
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
                    <div className={PROFILE_PASSWORD_FIELD_WRAPPER_CLASS}>
                      <Input
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className={`${PROFILE_INPUT_CLASS} ${PROFILE_INPUT_GROUP_HOVER_CLASS} pr-10`}
                        aria-invalid={!!errors.confirmNewPassword}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={PROFILE_PASSWORD_TOGGLE_CLASS}
                        onClick={() => setShowConfirm((p) => !p)}
                        aria-label={
                          showConfirm ? "Hide password" : "Show password"
                        }
                      >
                        {showConfirm ? (
                          <EyeOff className="size-4" aria-hidden />
                        ) : (
                          <Eye className="size-4" aria-hidden />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
