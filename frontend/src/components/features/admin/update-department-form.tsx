"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  Department,
  UpdateDepartmentBody,
} from "@/lib/schemas/departments.schema";
import { updateDepartmentBodySchema } from "@/lib/schemas/departments.schema";
import { getErrorMessage } from "@/lib/errors";
import { FORM_ERROR_BLOCK_CLASS } from "./constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UpdateDepartmentFormProps {
  department: Department;
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (params: { id: string; body: UpdateDepartmentBody }) => Promise<unknown>;
  error: Error | null;
  /** When "dialog", no card wrapper; use inside a Dialog. */
  variant?: "default" | "dialog";
}

export function UpdateDepartmentForm({
  department,
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
  variant = "default",
}: UpdateDepartmentFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UpdateDepartmentBody>({
    resolver: zodResolver(updateDepartmentBodySchema),
    defaultValues: { name: department.name },
  });

  async function onSubmit(data: UpdateDepartmentBody) {
    if (data.name === undefined || data.name === department.name) {
      onCancel();
      return;
    }
    try {
      await mutateAsync({ id: department.id, body: { name: data.name } });
      onSuccess();
    } catch (e) {
      setError("root", {
        message: getErrorMessage(e, "Failed to update department. Please try again."),
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
          autoComplete="organization"
          placeholder="Department name"
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
