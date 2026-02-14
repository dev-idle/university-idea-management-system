"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreateCycleBody,
  CreateCycleFormValues,
} from "@/lib/schemas/submission-cycles.schema";
import { createCycleFormSchema } from "@/lib/schemas/submission-cycles.schema";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  FORM_ERROR_BLOCK_CLASS,
  FORM_BUTTON_CLASS,
  FORM_OUTLINE_BUTTON_CLASS,
  FORM_CARD_INPUT_CLASS,
  FORM_CARD_SELECT_TRIGGER_CLASS,
  FORM_CHECKBOX_ACADEMIC_CLASS,
} from "@/components/features/admin/constants";
import { useSubmissionCycleAcademicYearsQuery } from "@/hooks/use-submission-cycles";
import { useCategoriesQuery } from "@/hooks/use-categories";

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
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
  const interactionClosesAt = watch("interactionClosesAt");

  function setInteractionDefault() {
    if (!ideaSubmissionClosesAt) return;
    const d = new Date(ideaSubmissionClosesAt);
    d.setDate(d.getDate() + 14);
    setValue("interactionClosesAt", toDatetimeLocal(d), { shouldValidate: true });
  }

  async function onSubmit(data: CreateCycleFormValues) {
    try {
      const ideaSubmissionClosesAt = new Date(data.ideaSubmissionClosesAt);
      const interactionClosesAt = data.interactionClosesAt
        ? new Date(data.interactionClosesAt)
        : (() => {
            const d = new Date(ideaSubmissionClosesAt);
            d.setDate(d.getDate() + 14);
            return d;
          })();
      const body: CreateCycleBody = {
        academicYearId: data.academicYearId,
        name: data.name.trim(),
        categoryIds: data.categoryIds,
        ideaSubmissionClosesAt,
        interactionClosesAt,
      };
      await mutateAsync(body);
      onSuccess();
    } catch (e) {
      setError("root", {
        message: getErrorMessage(e, "Unable to create submission cycle."),
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={
        variant === "dialog"
          ? "flex flex-col gap-6"
          : "flex flex-col gap-6 rounded-xl border border-border/80 bg-card px-6 py-6 shadow-sm"
      }
    >
      {variant === "default" && (
        <div>
          <h2 className="font-sans text-base font-semibold tracking-tight text-foreground">
            Add submission cycle
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Create a new idea submission cycle (DRAFT). Each cycle is linked to an academic year and defines closure times for ideas, comments, and votes. Name is required and unique; select at least one category. Only one cycle can be ACTIVE at a time.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label className={FORM_LABEL_CLASS}>Academic year</Label>
        <Controller
          name="academicYearId"
          control={control}
          rules={{ required: "Academic year is required" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value || undefined}>
              <SelectTrigger className={FORM_CARD_SELECT_TRIGGER_CLASS}>
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
          <p className="mt-1.5 text-sm text-destructive" role="alert">
            {errors.academicYearId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cycle-name" className={FORM_LABEL_CLASS}>
          Name (required)
        </Label>
        <Input
          id="cycle-name"
          type="text"
          placeholder="Summer 2026"
          className={FORM_CARD_INPUT_CLASS}
          {...register("name")}
        />
        <p className="text-xs text-muted-foreground">
          Name is mandatory and cannot be duplicated.
        </p>
        {errors.name && (
          <p className="text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className={FORM_LABEL_CLASS}>Categories (at least one)</Label>
        <ScrollArea className="h-40 overflow-hidden rounded-lg border border-input px-3 py-2">
          <div className="flex flex-col gap-2 pt-0.5 pb-2 pr-1">
            {categories.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <Checkbox
                  className={FORM_CHECKBOX_ACADEMIC_CLASS}
                  checked={watch("categoryIds")?.includes(c.id) ?? false}
                  onCheckedChange={(checked) => {
                    const ids = watch("categoryIds") ?? [];
                    const next = checked
                      ? [...ids, c.id]
                      : ids.filter((id: string) => id !== c.id);
                    setValue("categoryIds", next, { shouldValidate: true });
                  }}
                />
                <span className="text-foreground">{c.name}</span>
              </label>
            ))}
          </div>
        </ScrollArea>
        {errors.categoryIds && (
          <p className="mt-1.5 text-sm text-destructive" role="alert">
            {errors.categoryIds.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
        <div className="space-y-2">
          <div className="flex min-h-[1.25rem] items-center">
            <Label htmlFor="ideaSubmissionClosesAt" className={FORM_LABEL_CLASS}>
              Idea submission closes
            </Label>
          </div>
          <Input
            id="ideaSubmissionClosesAt"
            type="datetime-local"
            className={FORM_CARD_INPUT_CLASS}
            {...register("ideaSubmissionClosesAt", {
              setValueAs: (v) => (v ? new Date(v) : undefined),
            })}
          />
          {errors.ideaSubmissionClosesAt && (
            <p className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.ideaSubmissionClosesAt.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="interactionClosesAt" className={FORM_LABEL_CLASS}>
            Comments & votes close
          </Label>
          <Input
            id="interactionClosesAt"
            type="datetime-local"
            className={FORM_CARD_INPUT_CLASS}
            value={interactionClosesAt ?? ""}
            onChange={(e) => {
              setValue("interactionClosesAt", e.target.value ?? "", {
                shouldValidate: true,
              });
            }}
          />
          <button
            type="button"
            onClick={setInteractionDefault}
            className="text-xs text-primary hover:underline"
          >
            Set to idea close + 14 days
          </button>
          {errors.interactionClosesAt && (
            <p className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.interactionClosesAt.message}
            </p>
          )}
        </div>
      </div>

      {(errors.root ?? error) && (
        <p
          className={FORM_ERROR_BLOCK_CLASS}
          role="alert"
          aria-live="polite"
        >
          {errors.root?.message ??
            getErrorMessage(error, "Unable to create submission cycle.")}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-border/80 pt-6">
        <Button type="submit" disabled={isPending} className={FORM_BUTTON_CLASS}>
          {isPending ? "Adding…" : "Add"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className={FORM_OUTLINE_BUTTON_CLASS}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
