"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  Category,
  UpdateCategoryBody,
} from "@/lib/schemas/categories.schema";
import { updateCategoryBodySchema } from "@/lib/schemas/categories.schema";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import {
  FORM_DIALOG_FORM_CLASS,
  FORM_DIALOG_FIELD_WRAPPER_CLASS,
  FORM_DIALOG_LABEL_CLASS,
  FORM_DIALOG_INPUT_CLASS,
  FORM_DIALOG_ROOT_ERROR_CLASS,
  FORM_ACTIONS_CLASS,
  FORM_ACTIONS_DIALOG_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_BUTTON_CLASS,
  FORM_OUTLINE_BUTTON_CLASS,
  FORM_CARD_INPUT_CLASS,
} from "@/components/features/admin/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UpdateCategoryFormProps {
  category: Category;
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (params: { id: string; body: UpdateCategoryBody }) => Promise<unknown>;
  error: Error | null;
  /** When "dialog", no card wrapper; use inside a Dialog. */
  variant?: "default" | "dialog";
}

export function UpdateCategoryForm({
  category,
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
  variant = "default",
}: UpdateCategoryFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UpdateCategoryBody>({
    resolver: zodResolver(updateCategoryBodySchema),
    defaultValues: { name: category.name },
  });

  async function onSubmit(data: UpdateCategoryBody) {
    if (data.name === undefined || data.name === category.name) {
      onCancel();
      return;
    }
    try {
      await mutateAsync({ id: category.id, body: { name: data.name } });
      onSuccess();
    } catch (e) {
      setError("root", {
        message: getErrorMessage(e, ERROR_FALLBACK_FORM.updateCategory),
      });
    }
  }

  const isDialog = variant === "dialog";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={
        isDialog
          ? FORM_DIALOG_FORM_CLASS
          : "flex flex-wrap items-end gap-6 rounded-xl border border-border/80 bg-card p-6 shadow-sm"
      }
    >
      <div className={isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "min-w-[200px] flex-1 space-y-2"}>
        <Label htmlFor="edit-name" className={FORM_DIALOG_LABEL_CLASS}>
          Name
        </Label>
        <Input
          id="edit-name"
          type="text"
          autoComplete="off"
          placeholder="Category name"
          className={isDialog ? FORM_DIALOG_INPUT_CLASS : FORM_CARD_INPUT_CLASS}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "edit-name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="edit-name-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
            {errors.name.message}
          </p>
        )}
      </div>
      {(errors.root ?? error) && (
        <p
          className={FORM_DIALOG_ROOT_ERROR_CLASS}
          role="alert"
          aria-live="polite"
        >
          {errors.root?.message ??
            getErrorMessage(error, ERROR_FALLBACK_FORM.updateCategory)}
        </p>
      )}
      <div className={isDialog ? FORM_ACTIONS_DIALOG_CLASS : FORM_ACTIONS_CLASS}>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className={FORM_OUTLINE_BUTTON_CLASS}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className={FORM_BUTTON_CLASS}
        >
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
