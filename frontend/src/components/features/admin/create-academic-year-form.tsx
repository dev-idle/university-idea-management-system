"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreateAcademicYearBody,
  CreateAcademicYearFormValues,
} from "@/lib/schemas/academic-years.schema";
import { createAcademicYearFormSchema } from "@/lib/schemas/academic-years.schema";
import { getErrorMessage } from "@/lib/errors";
import {
  FORM_ACTIONS_DIALOG_CLASS,
  FORM_ACTIONS_CLASS,
  FORM_BUTTON_CLASS,
  FORM_OUTLINE_BUTTON_CLASS,
  FORM_DIALOG_LABEL_CLASS,
  FORM_DIALOG_INPUT_CLASS,
  FORM_DIALOG_FORM_CLASS,
  FORM_DIALOG_FIELD_WRAPPER_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_CARD_INPUT_CLASS,
} from "./constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateAcademicYearFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (body: CreateAcademicYearBody) => Promise<unknown>;
  /** When "dialog", renders form only (no card); use inside a Dialog. */
  variant?: "default" | "dialog";
}

export function CreateAcademicYearForm({
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  variant = "default",
}: CreateAcademicYearFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateAcademicYearFormValues>({
    resolver: zodResolver(createAcademicYearFormSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
    },
  });

  async function onSubmit(data: CreateAcademicYearFormValues) {
    // Cross-field: end date must be >= start date
    if (data.startDate && new Date(data.endDate) < new Date(data.startDate)) {
      setError("endDate", {
        type: "manual",
        message: "End date must be on or after start date.",
      });
      return;
    }
    try {
      const body: CreateAcademicYearBody = {
        name: data.name.trim(),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };
      await mutateAsync(body);
      onSuccess();
    } catch (e) {
      const message = getErrorMessage(e, "Unable to create academic year.");
      const lower = message.toLowerCase();
      const isDuplicateName =
        (lower.includes("already exists") &&
          (lower.includes("name") || lower.includes("year"))) ||
        lower.includes("duplicate") ||
        lower.includes("duplicated");
      if (isDuplicateName) {
        setError("name", { type: "server", message });
      }
    }
  }

  const isDialog = variant === "dialog";
  const labelClass = isDialog ? FORM_DIALOG_LABEL_CLASS : "text-muted-foreground text-[11px] font-medium uppercase tracking-[0.12em]";
  const inputBaseClass = isDialog ? FORM_DIALOG_INPUT_CLASS : FORM_CARD_INPUT_CLASS;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={
        isDialog
          ? FORM_DIALOG_FORM_CLASS
          : "space-y-6 rounded-xl border border-border/80 bg-card px-6 py-6 shadow-sm"
      }
    >
      {variant === "default" && (
        <div>
          <h2 className="font-sans text-base font-semibold tracking-tight text-foreground">
            Add academic year
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Define a new academic year with name and date range. Exactly one year can be active at a time.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className={isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "group min-w-0 space-y-2"}>
          <Label htmlFor="name" className={labelClass}>
            Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. 2026-2027"
            className={inputBaseClass}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="name-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.name.message}
            </p>
          )}
          {variant !== "dialog" && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Use format YYYY-YYYY (e.g. 2026-2027). Names must be unique.
            </p>
          )}
        </div>
        <div className={isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "group min-w-0 space-y-2"}>
          <Label htmlFor="startDate" className={labelClass}>
            Start date
          </Label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="startDate"
                value={field.value}
                onChange={field.onChange}
                placeholder="Select start date"
                aria-invalid={!!errors.startDate}
                aria-describedby={errors.startDate ? "startDate-error" : undefined}
                className={inputBaseClass}
              />
            )}
          />
          {errors.startDate && (
            <p id="startDate-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.startDate.message}
            </p>
          )}
        </div>
        <div className={isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "group min-w-0 space-y-2"}>
          <Label htmlFor="endDate" className={labelClass}>
            End date
          </Label>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="endDate"
                value={field.value}
                onChange={field.onChange}
                placeholder="Select end date"
                aria-invalid={!!errors.endDate}
                aria-describedby={errors.endDate ? "endDate-error" : undefined}
                className={inputBaseClass}
              />
            )}
          />
          {errors.endDate && (
            <p id="endDate-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>
      <div
        className={
          variant === "dialog" ? FORM_ACTIONS_DIALOG_CLASS : FORM_ACTIONS_CLASS
        }
      >
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
