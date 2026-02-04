"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UpdateUserBody } from "@/lib/schemas/users.schema";
import { updateUserBodySchema } from "@/lib/schemas/users.schema";
import type { UserListItem } from "@/lib/schemas/users.schema";
import { getErrorMessage } from "@/lib/errors";
import { FORM_ERROR_BLOCK_CLASS } from "./constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditUserFormProps {
  user: UserListItem;
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (params: { id: string; body: UpdateUserBody }) => Promise<unknown>;
  error: Error | null;
  /** When "dialog", renders form only; use inside a Dialog. Matches Add User form variant handling. */
  variant?: "default" | "dialog";
}

export function EditUserForm({
  user,
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
  variant = "default",
}: EditUserFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UpdateUserBody>({
    resolver: zodResolver(updateUserBodySchema),
    defaultValues: {
      fullName: user.fullName ?? "",
      newPassword: "",
    },
  });

  async function onSubmit(data: UpdateUserBody) {
    const fullName =
      data.fullName?.trim() === "" ? null : (data.fullName?.trim() ?? null);
    const newPassword =
      data.newPassword?.trim() && data.newPassword.trim().length >= 8
        ? data.newPassword.trim()
        : undefined;

    if (fullName === (user.fullName ?? null) && !newPassword) {
      onCancel();
      return;
    }

    try {
      await mutateAsync({
        id: user.id,
        body: {
          fullName,
          ...(newPassword ? { newPassword } : {}),
        },
      });
      onSuccess();
    } catch (e) {
      setError("root", {
        message: getErrorMessage(e, "Failed to update user. Please try again."),
      });
    }
  }

  const hasError = !!errors.root || !!error;
  const labelClass =
    "text-muted-foreground text-[11px] font-medium uppercase tracking-[0.12em]";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      aria-describedby={hasError ? "edit-user-form-error" : undefined}
    >
      {variant === "default" && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Update display name or reset password. Leave password blank to keep the current one.
        </p>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="edit-fullName" className={labelClass}>
            Full name
          </Label>
          <Input
            id="edit-fullName"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            className="h-10 w-full text-sm rounded-lg"
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "edit-fullName-error" : undefined}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p id="edit-fullName-error" className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="min-w-0 space-y-2">
          <Label htmlFor="edit-newPassword" className={labelClass}>
            New password{" "}
            <span className="font-normal normal-case text-muted-foreground/80">
              (optional)
            </span>
          </Label>
          <Input
            id="edit-newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Leave blank to keep current"
            className="h-10 w-full text-sm rounded-lg"
            aria-invalid={!!errors.newPassword}
            aria-describedby={errors.newPassword ? "edit-newPassword-error" : undefined}
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p id="edit-newPassword-error" className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.newPassword.message}
            </p>
          )}
        </div>
      </div>

      {(errors.root ?? error) && (
        <p
          id="edit-user-form-error"
          className={FORM_ERROR_BLOCK_CLASS}
          role="alert"
          aria-live="polite"
        >
          {errors.root?.message ?? error?.message}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-border/80 pt-6">
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-lg px-5 text-sm font-medium"
        >
          {isPending ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="h-10 rounded-lg px-5 text-sm font-medium"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
