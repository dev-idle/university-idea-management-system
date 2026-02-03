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
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const GENERIC_ERROR = "Unable to update password. Please try again.";

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
      setError("root", { message: GENERIC_ERROR });
    }
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-border/90 bg-card shadow-sm">
      <CardHeader className="border-border/80 border-b px-6 py-5">
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 items-center">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground [&>svg]:shrink-0">
            <KeyRound className="size-4" strokeWidth={1.25} aria-hidden />
          </div>
          <CardTitle className="font-serif text-base font-semibold tracking-tight text-foreground">
            Change password
          </CardTitle>
          <p className="col-start-1 col-span-2 row-start-2 text-muted-foreground text-sm leading-relaxed">
            Signs you out on other devices.
          </p>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
            aria-label="Change password"
          >
            {errors.root && (
              <p
                className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-destructive text-sm leading-relaxed"
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
                <FormItem>
                  <FormLabel className="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.12em]">
                    Current password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrent ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="h-10 rounded-lg pr-10"
                        aria-invalid={!!errors.currentPassword}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-primary/10 hover:text-primary"
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
                <FormItem>
                  <FormLabel className="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.12em]">
                    New password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="h-10 rounded-lg pr-10"
                        aria-invalid={!!errors.newPassword}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-primary/10 hover:text-primary"
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
                  <FormDescription className="text-muted-foreground text-xs leading-relaxed">
                    At least 8 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.12em]">
                    Confirm new password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="h-10 rounded-lg pr-10"
                        aria-invalid={!!errors.confirmNewPassword}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-primary/10 hover:text-primary"
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
            <div className="border-border/80 border-t pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="h-10 rounded-lg px-5 text-sm font-medium"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"
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
