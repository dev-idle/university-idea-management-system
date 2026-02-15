"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreateCycleBody,
  CreateCycleFormValues,
} from "@/lib/schemas/submission-cycles.schema";
import { createCycleFormSchema } from "@/lib/schemas/submission-cycles.schema";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FORM_LABEL_CLASS,
  FORM_DIALOG_FORM_CLASS,
  FORM_DIALOG_FIELD_WRAPPER_CLASS,
  FORM_DIALOG_LABEL_CLASS,
  FORM_DIALOG_INPUT_CLASS,
  FORM_DIALOG_SELECT_TRIGGER_CLASS,
  FORM_DIALOG_ROOT_ERROR_CLASS,
  FORM_ACTIONS_CLASS,
  FORM_ACTIONS_DIALOG_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_BUTTON_CLASS,
  FORM_OUTLINE_BUTTON_CLASS,
  FORM_CARD_INPUT_CLASS,
  FORM_CARD_SELECT_TRIGGER_CLASS,
  FORM_CHECKBOX_ACADEMIC_CLASS,
} from "@/components/features/admin/constants";
import { useSubmissionCycleAcademicYearsQuery } from "@/hooks/use-submission-cycles";
import { useCategoriesQuery } from "@/hooks/use-categories";

function toDatetimeLocal(d: Date, time = "23:59"): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const [h, min] = time.split(":").map(Number);
  return `${y}-${m}-${day}T${pad(h ?? 23)}:${pad(min ?? 59)}`;
}

interface CreateCycleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (body: CreateCycleBody) => Promise<unknown>;
  error: Error | null;
  variant?: "default" | "dialog";
}

export function CreateCycleForm({
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
  variant = "default",
}: CreateCycleFormProps) {
  const { data: academicYears = [] } = useSubmissionCycleAcademicYearsQuery();
  const { data: categories = [] } = useCategoriesQuery();

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCycleFormValues>({
    resolver: zodResolver(createCycleFormSchema),
    defaultValues: {
      name: "",
      academicYearId: "",
      categoryIds: [],
      ideaSubmissionClosesAt: "",
      interactionClosesAt: "",
    },
  });

  const ideaSubmissionClosesAt = watch("ideaSubmissionClosesAt");

  function setInteractionDefault() {
    if (!ideaSubmissionClosesAt) return;
    const d = new Date(ideaSubmissionClosesAt);
    d.setDate(d.getDate() + 14);
    const timePart = ideaSubmissionClosesAt.split("T")[1]?.slice(0, 5);
    const time = timePart ?? "23:59";
    setValue("interactionClosesAt", toDatetimeLocal(d, time), { shouldValidate: true });
  }

  async function onSubmit(data: CreateCycleFormValues) {
    try {
      const body: CreateCycleBody = {
        academicYearId: data.academicYearId,
        name: data.name.trim(),
        categoryIds: data.categoryIds,
        ideaSubmissionClosesAt: new Date(data.ideaSubmissionClosesAt),
        interactionClosesAt: new Date(data.interactionClosesAt),
      };
      await mutateAsync(body);
      onSuccess();
    } catch (e) {
      setError("root", {
        message: getErrorMessage(e, ERROR_FALLBACK_FORM.createCycle),
      });
    }
  }

  const isDialog = variant === "dialog";
  const labelClass = isDialog ? FORM_DIALOG_LABEL_CLASS : FORM_LABEL_CLASS;
  const inputClass = isDialog ? FORM_DIALOG_INPUT_CLASS : FORM_CARD_INPUT_CLASS;
  const triggerClass = isDialog ? FORM_DIALOG_SELECT_TRIGGER_CLASS : FORM_CARD_SELECT_TRIGGER_CLASS;
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
          <h2 className="font-sans text-base font-semibold tracking-tight text-foreground">
            Add submission cycle
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Create a new submission cycle (DRAFT). Linked to an academic year; define closure times.
          </p>
        </div>
      )}

      <div className={fieldWrapper}>
        <Label className={labelClass}>Academic year</Label>
        <Controller
          name="academicYearId"
          control={control}
          rules={{ required: "Academic year is required" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value || undefined}>
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((y) => (
                  <SelectItem key={y.id} value={y.id}>
                    {y.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.academicYearId && (
          <p className={FORM_FIELD_ERROR_CLASS} role="alert">
            {errors.academicYearId.message}
          </p>
        )}
      </div>

      <div className={fieldWrapper}>
        <Label htmlFor="cycle-name" className={labelClass}>
          Name
        </Label>
        <Input
          id="cycle-name"
          type="text"
          placeholder="e.g. Summer 2026"
          className={inputClass}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "cycle-name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="cycle-name-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className={fieldWrapper}>
        <Label className={labelClass}>Categories</Label>
        <Controller
          name="categoryIds"
          control={control}
          render={({ field }) => (
            <ScrollArea className="h-40 overflow-hidden rounded-lg border border-input px-3 py-2">
              <div className="flex flex-col gap-2 pt-2 pb-2 pr-1">
                {categories.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
        <div className={fieldWrapper}>
          <Label htmlFor="ideaSubmissionClosesAt" className={labelClass}>
            Idea closes
          </Label>
          <Controller
            name="ideaSubmissionClosesAt"
            control={control}
            rules={{ required: "Idea submission closure is required" }}
            render={({ field }) => (
              <DateTimePicker
                id="ideaSubmissionClosesAt"
                value={field.value}
                onChange={field.onChange}
                placeholder="Select date and time"
                aria-invalid={!!errors.ideaSubmissionClosesAt}
                aria-describedby={errors.ideaSubmissionClosesAt ? "ideaSubmissionClosesAt-error" : undefined}
                className={inputClass}
              />
            )}
          />
          {errors.ideaSubmissionClosesAt && (
            <p id="ideaSubmissionClosesAt-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.ideaSubmissionClosesAt.message}
            </p>
          )}
        </div>
        <div className={fieldWrapper}>
          <Label htmlFor="interactionClosesAt" className={labelClass}>
            Comments & votes close
          </Label>
          <Controller
            name="interactionClosesAt"
            control={control}
            rules={{ required: "Comments and votes closure is required" }}
            render={({ field }) => (
              <DateTimePicker
                id="interactionClosesAt"
                value={field.value}
                onChange={field.onChange}
                placeholder="Select date and time"
                aria-invalid={!!errors.interactionClosesAt}
                aria-describedby={errors.interactionClosesAt ? "interactionClosesAt-error" : undefined}
                className={inputClass}
              />
            )}
          />
          <button
            type="button"
            onClick={setInteractionDefault}
            className="text-xs text-primary hover:underline"
          >
            +14 days from idea close
          </button>
          {errors.interactionClosesAt && (
            <p className={FORM_FIELD_ERROR_CLASS} role="alert">
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
            getErrorMessage(error, ERROR_FALLBACK_FORM.createCycle)}
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
          {isPending ? "Adding…" : "Add"}
        </Button>
      </div>
    </form>
  );
}
