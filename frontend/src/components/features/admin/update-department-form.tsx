"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  Department,
  UpdateDepartmentBody,
} from "@/lib/schemas/departments.schema";
import { updateDepartmentBodySchema } from "@/lib/schemas/departments.schema";
import { getErrorMessage } from "@/lib/errors";
import {
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

interface UpdateDepartmentFormProps {
  department: Department;
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (params: { id: string; body: UpdateDepartmentBody }) => Promise<unknown>;
  /** When "dialog", no card wrapper; use inside a Dialog. */
  variant?: "default" | "dialog";
}

export function UpdateDepartmentForm({
  department,
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
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
      const message = getErrorMessage(e, "Unable to update department.");
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
  const labelClass = isDialog
    ? FORM_DIALOG_LABEL_CLASS
    : "text-muted-foreground text-[11px] font-medium uppercase tracking-[0.12em]";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={
        isDialog
          ? FORM_DIALOG_FORM_CLASS
          : "flex flex-wrap items-end gap-6 rounded-xl border border-border/90 bg-card p-6 shadow-sm"
      }
    >
      <div className={isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "min-w-[200px] flex-1 space-y-2"}>
        <Label htmlFor="edit-name" className={labelClass}>
          Name
        </Label>
        <Input
          id="edit-name"
          type="text"
          autoComplete="organization"
          placeholder="Department name"
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
