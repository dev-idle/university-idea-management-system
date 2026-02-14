"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateCategoryBody } from "@/lib/schemas/categories.schema";
import { createCategoryBodySchema } from "@/lib/schemas/categories.schema";
import { getErrorMessage } from "@/lib/errors";
import { FORM_ERROR_BLOCK_CLASS, FORM_BUTTON_CLASS, FORM_OUTLINE_BUTTON_CLASS, FORM_CARD_INPUT_CLASS, FORM_DIALOG_LABEL_CLASS } from "@/components/features/admin/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateCategoryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (body: CreateCategoryBody) => Promise<unknown>;
  error: Error | null;
  /** When "dialog", renders form only (no card); use inside a Dialog. */
  variant?: "default" | "dialog";
}

export function CreateCategoryForm({
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
  variant = "default",
}: CreateCategoryFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateCategoryBody>({
    resolver: zodResolver(createCategoryBodySchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(data: CreateCategoryBody) {
    try {
      await mutateAsync(data);
      onSuccess();
    } catch (e) {
      setError("root", {
        message: getErrorMessage(e, "Unable to create category."),
      });
    }
  }

  const labelClass = FORM_DIALOG_LABEL_CLASS;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={
        variant === "dialog"
          ? "space-y-6"
          : "space-y-6 rounded-xl border border-border/90 bg-card px-6 py-6 shadow-sm"
      }
    >
      {variant === "default" && (
        <div>
          <h2 className="font-sans text-base font-semibold tracking-tight text-foreground">
            Add category
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Create a new category for idea classification.
          </p>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name" className={labelClass}>
          Name
        </Label>
        <Input
          id="name"
          type="text"
          autoComplete="off"
          placeholder="e.g. Teaching & Learning"
          className={FORM_CARD_INPUT_CLASS}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="name-error" className="mt-1.5 text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>
      {(errors.root ?? error) && (
        <p
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
          className={FORM_BUTTON_CLASS}
        >
          {isPending ? "Adding…" : "Add"}
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
