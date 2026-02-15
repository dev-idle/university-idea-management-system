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
} from "./constants";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function toInputDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

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
          (data.endDate === "" ? { endDate: null } : { endDate: new Date(data.endDate) })),
      };
      await mutateAsync({
        id: academicYear.id,
        body,
      });
      onSuccess();
    } catch (e) {
      setError("root", {
        message: getErrorMessage(e, ERROR_FALLBACK_FORM.updateAcademicYear),
      });
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className={isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "group min-w-0 space-y-2"}>
          <Label htmlFor="edit-name" className={labelClass}>
            Name
          </Label>
          <Input
            id="edit-name"
            type="text"
            placeholder="e.g. 2026-2027"
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
                className={inputBaseClass}
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
            End date{" "}
            <span className="font-normal normal-case text-muted-foreground/80">
              (optional)
            </span>
          </Label>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="edit-endDate"
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Select end date (optional)"
                aria-invalid={!!errors.endDate}
                aria-describedby={
                  errors.endDate ? "edit-endDate-error" : undefined
                }
                className={inputBaseClass}
              />
            )}
          />
          {errors.endDate && (
            <p id="edit-endDate-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.endDate.message}
            </p>
          )}
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
