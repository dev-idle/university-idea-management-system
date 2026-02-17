"use client";

import type { Resolver } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import type { SubmissionCycle, UpdateCycleBody } from "@/lib/schemas/submission-cycles.schema";
import { updateCycleFormSchemaWithAcademicYear, type UpdateCycleFormValues } from "@/lib/schemas/submission-cycles.schema";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FORM_LABEL_CLASS,
  FORM_DIALOG_FORM_CLASS,
  FORM_DIALOG_FIELD_WRAPPER_CLASS,
  FORM_DIALOG_LABEL_CLASS,
  FORM_DIALOG_INPUT_CLASS,
  FORM_DIALOG_ROOT_ERROR_CLASS,
  FORM_ACTIONS_CLASS,
  FORM_ACTIONS_DIALOG_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_BUTTON_CLASS,
  FORM_OUTLINE_BUTTON_CLASS,
  FORM_CARD_INPUT_CLASS,
  DATE_PICKER_INPUT_CLASS,
  FORM_CHECKBOX_ACADEMIC_CLASS,
  FORM_CATEGORIES_SCROLL_AREA_CLASS,
} from "@/components/features/admin/constants";
import { useCategoriesQuery } from "@/hooks/use-categories";
import { cn } from "@/lib/utils";

function dateToDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface UpdateCycleFormProps {
  cycle: SubmissionCycle;
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (params: { id: string; body: UpdateCycleBody }) => Promise<unknown>;
  error: Error | null;
  variant?: "default" | "dialog";
}

export function UpdateCycleForm({
  cycle,
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
  variant = "default",
}: UpdateCycleFormProps) {
  const { data: categories = [] } = useCategoriesQuery();

  const updateCycleFormSchema = useMemo(
    () => updateCycleFormSchemaWithAcademicYear(cycle.academicYear),
    [cycle.academicYear]
  );

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateCycleFormValues>({
    resolver: zodResolver(updateCycleFormSchema) as Resolver<UpdateCycleFormValues>,
    defaultValues: {
      name: (cycle.name ?? "").trim() || "",
      categoryIds: cycle.categories.map((c) => c.id),
      ideaSubmissionClosesAt: dateToDatetimeLocal(cycle.ideaSubmissionClosesAt),
      interactionClosesAt: dateToDatetimeLocal(cycle.interactionClosesAt),
    },
  });

  const ideaSubmissionClosesAt = watch("ideaSubmissionClosesAt");

  function setInteractionDefault() {
    if (!ideaSubmissionClosesAt) return;
    const d = new Date(ideaSubmissionClosesAt);
    d.setDate(d.getDate() + 14);
    const timePart = String(ideaSubmissionClosesAt).split("T")[1]?.slice(0, 5);
    const time = timePart ?? "23:59";
    const pad = (n: number) => String(n).padStart(2, "0");
    const str = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${time}`;
    setValue("interactionClosesAt", str, { shouldValidate: true });
  }

  async function onSubmit(data: UpdateCycleFormValues) {
    try {
      const name = (data.name ?? "").trim();
      await mutateAsync({
        id: cycle.id,
        body: {
          name: name || undefined,
          categoryIds: data.categoryIds,
          ideaSubmissionClosesAt: new Date(data.ideaSubmissionClosesAt),
          interactionClosesAt: new Date(data.interactionClosesAt),
        },
      });
      onSuccess();
    } catch (e) {
      setError("root", {
        message: getErrorMessage(e, ERROR_FALLBACK_FORM.updateCycle),
      });
    }
  }

  const isDialog = variant === "dialog";
  const labelClass = isDialog ? FORM_DIALOG_LABEL_CLASS : FORM_LABEL_CLASS;
  const inputClass = isDialog ? FORM_DIALOG_INPUT_CLASS : FORM_CARD_INPUT_CLASS;
  const dateTimeClass = DATE_PICKER_INPUT_CLASS;
  const fieldWrapper = isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "space-y-2";

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
          <h3 className="font-sans text-base font-semibold tracking-tight text-foreground">
            Edit proposal cycle
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Update closure times for DRAFT or ACTIVE cycles.
          </p>
        </div>
      )}

      <div className={fieldWrapper}>
        <span className={labelClass}>Academic year</span>
        <p className="text-sm font-medium text-foreground">{cycle.academicYear.name}</p>
      </div>

      <div className={fieldWrapper}>
        <Label htmlFor="edit-cycle-name" className={labelClass}>
          Name
        </Label>
        <Input
          id="edit-cycle-name"
          type="text"
          placeholder="e.g. Summer 2026"
          className={inputClass}
          aria-invalid={!!errors.name}
          {...register("name", { required: "Name is required", minLength: { value: 1, message: "Name is required" } })}
        />
        {errors.name && (
          <p className={FORM_FIELD_ERROR_CLASS} role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className={fieldWrapper}>
        <Label htmlFor={categories[0] ? `edit-cycle-cat-${categories[0].id}` : undefined} className={cn(labelClass, categories.length > 0 && "cursor-pointer")}>Categories</Label>
        <Controller
          name="categoryIds"
          control={control}
          render={({ field }) => (
            <ScrollArea className={FORM_CATEGORIES_SCROLL_AREA_CLASS}>
              <div className="flex flex-col gap-2 pt-2 pb-2 pr-1">
                {categories.map((c, idx) => (
                  <label
                    key={c.id}
                    htmlFor={idx === 0 ? `edit-cycle-cat-${c.id}` : undefined}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      id={idx === 0 ? `edit-cycle-cat-${c.id}` : undefined}
                      className={FORM_CHECKBOX_ACADEMIC_CLASS}
                      checked={field.value?.includes(c.id) ?? false}
                      onCheckedChange={(checked) => {
                        const ids = field.value ?? [];
                        const next =
                          checked === true
                            ? [...ids, c.id]
                            : ids.filter((id: string) => id !== c.id);
                        field.onChange(next);
                      }}
                    />
                    <span className="text-foreground">{c.name}</span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          )}
        />
        {errors.categoryIds && (
          <p className={FORM_FIELD_ERROR_CLASS} role="alert">
            {errors.categoryIds.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:items-start">
        <div className={fieldWrapper}>
          <Label htmlFor="edit-ideaSubmissionClosesAt" className={labelClass}>
            Idea closes
          </Label>
          <Controller
            name="ideaSubmissionClosesAt"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                id="edit-ideaSubmissionClosesAt"
                value={field.value}
                onChange={field.onChange}
                placeholder="Select date and time"
                aria-invalid={!!errors.ideaSubmissionClosesAt}
                aria-describedby={errors.ideaSubmissionClosesAt ? "edit-ideaSubmissionClosesAt-error" : undefined}
                className={dateTimeClass}
              />
            )}
          />
          {errors.ideaSubmissionClosesAt && (
            <p id="edit-ideaSubmissionClosesAt-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.ideaSubmissionClosesAt.message}
            </p>
          )}
        </div>
        <div className={fieldWrapper}>
          <Label htmlFor="edit-interactionClosesAt" className={labelClass}>
            Comments & votes close
          </Label>
          <Controller
            name="interactionClosesAt"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                id="edit-interactionClosesAt"
                value={field.value}
                onChange={field.onChange}
                placeholder="Select date and time"
                aria-invalid={!!errors.interactionClosesAt}
                aria-describedby={errors.interactionClosesAt ? "edit-interactionClosesAt-error" : undefined}
                className={dateTimeClass}
              />
            )}
          />
          <button
            type="button"
            onClick={setInteractionDefault}
            className="text-xs text-muted-foreground/80 transition-colors duration-200 hover:text-primary hover:bg-primary/[0.06] rounded-md px-2 py-1 -ml-2"
          >
            +14 days from idea close
          </button>
          {errors.interactionClosesAt && (
            <p id="edit-interactionClosesAt-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.interactionClosesAt.message}
            </p>
          )}
        </div>
      </div>

      {(errors.root ?? error) && (
        <p
          className={FORM_DIALOG_ROOT_ERROR_CLASS}
          role="alert"
          aria-live="polite"
        >
          {errors.root?.message ??
            getErrorMessage(error, ERROR_FALLBACK_FORM.updateCycle)}
        </p>
      )}

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
        <Button type="submit" disabled={isPending} className={FORM_BUTTON_CLASS}>
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
