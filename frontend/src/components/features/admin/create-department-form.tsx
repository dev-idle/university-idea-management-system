"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateDepartmentBody } from "@/lib/schemas/departments.schema";
import { createDepartmentBodySchema } from "@/lib/schemas/departments.schema";
import { getErrorMessage } from "@/lib/errors";
import { FORM_LABEL_CLASS, FORM_ERROR_BLOCK_CLASS } from "./constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateDepartmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (body: CreateDepartmentBody) => Promise<unknown>;
  error: Error | null;
  /** When "dialog", renders form only (no card); use inside a Dialog. */
  variant?: "default" | "dialog";
}

export function CreateDepartmentForm({
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
  variant = "default",
}: CreateDepartmentFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateDepartmentBody>({
    resolver: zodResolver(createDepartmentBodySchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(data: CreateDepartmentBody) {
    try {
      await mutateAsync(data);
      onSuccess();
    } catch (e) {
      setError("root", {
        message: getErrorMessage(e, "Failed to create department. Please try again."),
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={
        variant === "dialog"
          ? "flex flex-col gap-6"
          : "flex flex-col gap-6 rounded-xl border border-border/90 bg-card px-6 py-6 shadow-sm"
      }
    >
      {variant === "default" && (
        <div>
          <h2 className="font-serif text-base font-semibold tracking-tight text-foreground">
            Add department
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Create a new department for institutional organisation.
          </p>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name" className={FORM_LABEL_CLASS}>
          Name
        </Label>
        <Input
          id="name"
          type="text"
          autoComplete="organization"
          placeholder="e.g. Computer Science"
          className="h-10 w-full text-sm rounded-lg"
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
          className="h-10 rounded-lg px-5 text-sm font-medium"
        >
          {isPending ? "Creating…" : "Create department"}
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
