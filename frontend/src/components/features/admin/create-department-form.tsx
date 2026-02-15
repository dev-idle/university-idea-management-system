"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateDepartmentBody } from "@/lib/schemas/departments.schema";
import { createDepartmentBodySchema } from "@/lib/schemas/departments.schema";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import {
  FORM_LABEL_CLASS,
  FORM_ACTIONS_CLASS,
  FORM_ACTIONS_DIALOG_CLASS,
  FORM_BUTTON_CLASS,
  FORM_OUTLINE_BUTTON_CLASS,
  FORM_DIALOG_FORM_CLASS,
  FORM_DIALOG_LABEL_CLASS,
  FORM_DIALOG_INPUT_CLASS,
  FORM_DIALOG_FIELD_WRAPPER_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_CARD_INPUT_CLASS,
  DEPARTMENT_NAME_EXISTS_MESSAGE,
} from "./constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateDepartmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (body: CreateDepartmentBody) => Promise<unknown>;
  /** When "dialog", renders form only (no card); use inside a Dialog. */
  variant?: "default" | "dialog";
}

export function CreateDepartmentForm({
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
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
      const message = getErrorMessage(e, ERROR_FALLBACK_FORM.createDepartment);
      const lower = message.toLowerCase().replace(/\s+/g, " ");
      if (
        (lower.includes("department") && lower.includes("name")) ||
        lower.includes("already exists")
      ) {
        setError("name", { type: "server", message: DEPARTMENT_NAME_EXISTS_MESSAGE });
      } else {
        setError("name", { type: "server", message });
      }
    }
  }

  const isDialog = variant === "dialog";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={
        isDialog
          ? FORM_DIALOG_FORM_CLASS
          : "flex flex-col gap-6 rounded-xl border border-border/80 bg-card px-6 py-6 shadow-sm"
      }
    >
      {variant === "default" && (
        <div>
          <h2 className="font-sans text-base font-semibold tracking-tight text-foreground">
            Add Department
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Create a new department for institutional organisation.
          </p>
        </div>
      )}
      <div className={isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "space-y-2"}>
        <Label htmlFor="name" className={isDialog ? FORM_DIALOG_LABEL_CLASS : FORM_LABEL_CLASS}>
          Name
        </Label>
        <Input
          id="name"
          type="text"
          autoComplete="organization"
          placeholder="e.g. Computer Science"
          className={isDialog ? FORM_DIALOG_INPUT_CLASS : FORM_CARD_INPUT_CLASS}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="name-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
            {errors.name.message}
          </p>
        )}
      </div>
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
          {isPending ? "Adding…" : "Add"}
        </Button>
      </div>
    </form>
  );
}
