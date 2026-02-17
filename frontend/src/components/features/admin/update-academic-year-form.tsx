"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  AcademicYear,
  UpdateAcademicYearBody,
  UpdateAcademicYearFormValues,
} from "@/lib/schemas/academic-years.schema";
import { updateAcademicYearFormSchema } from "@/lib/schemas/academic-years.schema";
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
import { computeEndDateFromStart, toInputDate } from "./academic-years.utils";

interface UpdateAcademicYearFormProps {
  academicYear: AcademicYear;
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (params: {
    id: string;
    body: UpdateAcademicYearBody;
  }) => Promise<unknown>;
  /** When "dialog", no card wrapper or title; use inside a Dialog. */
  variant?: "default" | "dialog";
}

export function UpdateAcademicYearForm({
  academicYear,
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  variant = "default",
}: UpdateAcademicYearFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors },
  } = useForm<UpdateAcademicYearFormValues>({
    resolver: zodResolver(updateAcademicYearFormSchema),
    defaultValues: {
      name: academicYear.name,
      startDate: toInputDate(academicYear.startDate),
      endDate: academicYear.endDate ? toInputDate(academicYear.endDate) : "",
    },
  });

  async function onSubmit(data: UpdateAcademicYearFormValues) {
    try {
      const body: UpdateAcademicYearBody = {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.startDate !== undefined &&
          data.startDate !== "" && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined &&
          data.endDate !== "" && { endDate: new Date(data.endDate) }),
      };
      await mutateAsync({
        id: academicYear.id,
        body,
      });
      onSuccess();
    } catch (e) {
      const message = getErrorMessage(e, ERROR_FALLBACK_FORM.updateAcademicYear);
      const lower = message.toLowerCase();
      const isDateRangeError =
        (lower.includes("start date") || lower.includes("end date")) &&
        lower.includes("must be in");
      if (isDateRangeError) {
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={
        isDialog
          ? FORM_DIALOG_FORM_CLASS
          : "flex flex-col gap-6 rounded-xl border border-border/80 bg-card p-6 shadow-sm"
      }
    >
      {variant === "default" && (
        <div>
          <h3 className="font-sans text-base font-semibold tracking-tight text-foreground">
            Edit academic year
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Update name and dates. Use the table actions to set the active year.
          </p>
        </div>
      )}
      <div className="space-y-6">
        <div className={isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "group min-w-0 space-y-2"}>
          <Label htmlFor="edit-name" className={labelClass}>
            Name
          </Label>
          <Input
            id="edit-name"
            type="text"
            placeholder="e.g. 2025-2026"
            className={inputBaseClass}
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className={isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "group min-w-0 space-y-2"}>
            <Label htmlFor="edit-startDate" className={labelClass}>
              Start date
            </Label>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="edit-startDate"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Select start date"
                  aria-invalid={!!errors.startDate}
                  aria-describedby={
                    errors.startDate ? "edit-startDate-error" : undefined
                  }
                  className={DATE_PICKER_INPUT_CLASS}
                />
              )}
            />
            {errors.startDate && (
              <p id="edit-startDate-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
                {errors.startDate.message}
              </p>
            )}
          </div>
          <div className={isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "group min-w-0 space-y-2"}>
            <Label htmlFor="edit-endDate" className={labelClass}>
              End date
            </Label>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="edit-endDate"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Select end date"
                  aria-invalid={!!errors.endDate}
                  aria-describedby={
                    errors.endDate ? "edit-endDate-error" : undefined
                  }
                  className={DATE_PICKER_INPUT_CLASS}
                />
              )}
            />
            <button
              type="button"
              onClick={() => {
                const startVal = getValues("startDate");
                if (startVal) {
                  const { formatted } = computeEndDateFromStart(startVal);
                  setValue("endDate", formatted, {
                    shouldValidate: true,
                  });
                }
              }}
              className="text-xs text-muted-foreground/80 transition-colors duration-200 hover:text-primary hover:bg-primary/[0.06] rounded-md px-2 py-1 -ml-2"
            >
              +1 year from start date
            </button>
            {errors.endDate && (
              <p id="edit-endDate-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
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
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
