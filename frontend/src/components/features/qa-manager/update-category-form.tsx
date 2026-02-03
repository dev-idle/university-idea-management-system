"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  Category,
  UpdateCategoryBody,
} from "@/lib/schemas/categories.schema";
import { updateCategoryBodySchema } from "@/lib/schemas/categories.schema";
import { getErrorMessage } from "@/lib/errors";
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
        message: getErrorMessage(e, "Failed to update category. Please try again."),
      });
    }
  }

  const labelClass =
    "text-muted-foreground text-[11px] font-medium uppercase tracking-[0.12em]";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={
        variant === "dialog"
          ? "space-y-6"
          : "flex flex-wrap items-end gap-6 rounded-xl border border-border/90 bg-card p-6 shadow-sm"
      }
    >
      <div className={variant === "dialog" ? "space-y-2" : "min-w-[200px] flex-1 space-y-2"}>
        <Label htmlFor="edit-name" className={labelClass}>
          Name
        </Label>
        <Input
          id="edit-name"
          type="text"
          autoComplete="off"
          placeholder="Category name"
          className="h-10 w-full text-sm rounded-lg"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "edit-name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="edit-name-error" className="mt-1.5 text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>
      {(errors.root ?? error) && (
        <p
          className="rounded-lg border-l-4 border-destructive/50 border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm leading-relaxed text-destructive"
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
          {isPending ? "Saving…" : "Save"}
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
