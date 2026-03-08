"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreateAcademicYearBody,
  CreateAcademicYearFormValues,
} from "@/lib/schemas/academic-years.schema";
import { createAcademicYearFormSchema } from "@/lib/schemas/academic-years.schema";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import {
  FORM_ACTIONS_DIALOG_CLASS,
  FORM_ACTIONS_CLASS,
  FORM_BUTTON_CLASS,
  FORM_OUTLINE_BUTTON_CLASS,
  FORM_DIALOG_LABEL_CLASS,
  FORM_DIALOG_INPUT_CLASS,
  FORM_DIALOG_FORM_CLASS,
  FORM_DIALOG_FIELD_WRAPPER_CLASS,
  FORM_DIALOG_ROOT_ERROR_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_CARD_INPUT_CLASS,
  DATE_PICKER_INPUT_CLASS,
} from "./constants";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { computeEndDateFromStart } from "./academic-years.utils";

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
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateAcademicYearFormValues>({
    resolver: zodResolver(createAcademicYearFormSchema),
    mode: "onSubmit",
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
        message: "End date must be on or after start date",
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
      const message = getErrorMessage(e, ERROR_FALLBACK_FORM.createAcademicYear);
      const lower = message.toLowerCase();
      const isDuplicateName =
        (lower.includes("already exists") &&
          (lower.includes("name") || lower.includes("year"))) ||
        lower.includes("duplicate") ||
        lower.includes("duplicated");
      const isDateRangeError =
        (lower.includes("start date") || lower.includes("end date")) &&
        lower.includes("must be in");
      if (isDuplicateName) {
        setError("name", { type: "server", message });
      } else if (isDateRangeError) {
        // API may return "startDate: msg; endDate: msg" or single "Start/End date must..."
        const hasFieldPrefix = /^(startDate|endDate):/i.test(message);
        if (hasFieldPrefix) {
          const parts = message.split(/;\s*/);
          for (const part of parts) {
            const colonIdx = part.indexOf(":");
            if (colonIdx >= 0) {
              const field = part.slice(0, colonIdx).trim();
              const msg = part.slice(colonIdx + 1).trim();
              if (field === "startDate") setError("startDate", { type: "server", message: msg });
              else if (field === "endDate") setError("endDate", { type: "server", message: msg });
            }
          }
        } else {
          const isStart = lower.includes("start date");
          const isEnd = lower.includes("end date") && !isStart;
          if (isStart) setError("startDate", { type: "server", message });
          else if (isEnd) setError("endDate", { type: "server", message });
          else setError("startDate", { type: "server", message });
        }
      } else {
        setError("root", { type: "server", message });
      }
    }
  }

  const isDialog = variant === "dialog";
  const labelClass = isDialog ? FORM_DIALOG_LABEL_CLASS : "text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80";
  const inputBaseClass = isDialog ? FORM_DIALOG_INPUT_CLASS : FORM_CARD_INPUT_CLASS;
  const datePickerClass = DATE_PICKER_INPUT_CLASS;

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
            Add Academic Year
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Define a new academic year with name and date range. Exactly one year can be active at a time.
          </p>
        </div>
      )}
      <div className="space-y-6">
        <div className={isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "group min-w-0 space-y-2"}>
          <Label htmlFor="name" className={labelClass}>
            Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. 2025-2026"
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
              Use format YYYY-YYYY (e.g. 2025-2026). Start date in first year, end date in second year. Names must be unique.
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                  className={datePickerClass}
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
                  className={datePickerClass}
                />
              )}
            />
            <button
              type="button"
              onClick={() => {
                const startVal = getValues("startDate");
                if (startVal) {
                  const { formatted } = computeEndDateFromStart(startVal);
                  setValue("endDate", formatted, { shouldValidate: false });
                  clearErrors("endDate");
                }
              }}
              className="text-xs text-muted-foreground/80 transition-colors duration-200 hover:text-primary hover:bg-primary/[0.06] rounded-md px-2 py-1 -ml-2"
            >
              +1 year from start date
            </button>
            {errors.endDate && (
              <p id="endDate-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>
      </div>
      {errors.root && (
        <p
          className={FORM_DIALOG_ROOT_ERROR_CLASS}
          role="alert"
          aria-live="polite"
        >
          {errors.root.message}
        </p>
      )}
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
