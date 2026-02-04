"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UpdateUserBody } from "@/lib/schemas/users.schema";
import { updateUserBodySchema } from "@/lib/schemas/users.schema";
import type { UserListItem } from "@/lib/schemas/users.schema";
import { getErrorMessage } from "@/lib/errors";
import {
  FORM_LABEL_CLASS,
  FORM_DESCRIPTION_CLASS,
  FORM_ERROR_BLOCK_CLASS,
  FORM_BUTTON_CLASS,
  FORM_OUTLINE_BUTTON_CLASS,
  FORM_ACTIONS_CLASS,
} from "./constants";
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      aria-describedby={hasError ? "edit-user-form-error" : undefined}
    >
      {variant === "default" && (
        <p className={FORM_DESCRIPTION_CLASS}>
          Update display name or reset password. Leave password blank to keep the current one.
        </p>
      )}
      <div className="space-y-6">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="edit-fullName" className={FORM_LABEL_CLASS}>
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
          <Label htmlFor="edit-newPassword" className={FORM_LABEL_CLASS}>
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
          {getErrorMessage(errors.root ?? error, "Failed to update user. Please try again.")}
        </p>
      )}

      <div className={FORM_ACTIONS_CLASS}>
        <Button
          type="submit"
          disabled={isPending}
          className={FORM_BUTTON_CLASS}
        >
          {isPending ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className={FORM_OUTLINE_BUTTON_CLASS}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
