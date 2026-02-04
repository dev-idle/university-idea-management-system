"use client";

import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmissionCycle, UpdateCycleBody } from "@/lib/schemas/submission-cycles.schema";
import { updateCycleFormSchema, type UpdateCycleFormValues } from "@/lib/schemas/submission-cycles.schema";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FORM_LABEL_CLASS, FORM_ERROR_BLOCK_CLASS } from "@/components/features/admin/constants";
import { useCategoriesQuery } from "@/hooks/use-categories";

function toDatetimeLocal(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
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

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<UpdateCycleFormValues>({
    resolver: zodResolver(updateCycleFormSchema) as Resolver<UpdateCycleFormValues>,
    defaultValues: {
      name: (cycle.name ?? "").trim() || "",
      categoryIds: cycle.categories.map((c) => c.id),
      ideaSubmissionClosesAt: cycle.ideaSubmissionClosesAt,
      interactionClosesAt: cycle.interactionClosesAt,
    },
  });

  const ideaSubmissionClosesAt = watch("ideaSubmissionClosesAt");
  const interactionClosesAt = watch("interactionClosesAt");

  function setInteractionDefault() {
    if (!ideaSubmissionClosesAt) return;
    const d = new Date(ideaSubmissionClosesAt);
    d.setDate(d.getDate() + 14);
    setValue("interactionClosesAt", d, { shouldValidate: true });
  }

  async function onSubmit(data: UpdateCycleFormValues) {
    try {
      const name = (data.name ?? "").trim();
      await mutateAsync({
        id: cycle.id,
        body: {
          name: name || undefined,
          categoryIds: data.categoryIds,
          ideaSubmissionClosesAt: data.ideaSubmissionClosesAt,
          interactionClosesAt: data.interactionClosesAt,
        },
      });
      onSuccess();
    } catch (e) {
      setError("root", {
        message: getErrorMessage(e, "Failed to update submission cycle. Please try again."),
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={
        variant === "dialog"
          ? "flex flex-col gap-6"
          : "flex flex-col gap-6 rounded-xl border border-border/90 bg-card px-6 py-6 shadow-sm"
      }
    >
      {variant === "default" && (
        <div>
          <h3 className="font-serif text-base font-semibold tracking-tight text-foreground">
            Edit submission cycle
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            DRAFT and ACTIVE cycles can be updated. Closure times for ideas, comments, and votes can be adjusted. Name is required and cannot be duplicated; academic year is read-only.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label className={FORM_LABEL_CLASS}>Academic year (read-only)</Label>
        <p className="text-sm font-medium text-foreground">{cycle.academicYear.name}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-cycle-name" className={FORM_LABEL_CLASS}>
          Name (required)
        </Label>
        <Input
          id="edit-cycle-name"
          type="text"
          placeholder="Summer 2026"
          className="h-10 w-full text-sm rounded-lg"
          {...register("name", { required: "Name is required", minLength: { value: 1, message: "Name is required" } })}
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
                  checked={watch("categoryIds")?.includes(c.id) ?? false}
                  onCheckedChange={(checked) => {
                    const ids = getValues("categoryIds") ?? [];
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
            <Label htmlFor="edit-ideaSubmissionClosesAt" className={FORM_LABEL_CLASS}>
              Idea submission closes
            </Label>
          </div>
          <Input
            id="edit-ideaSubmissionClosesAt"
            type="datetime-local"
            className="h-10 w-full text-sm rounded-lg"
            {...register("ideaSubmissionClosesAt", {
              setValueAs: (v) => (v ? new Date(v) : undefined),
            })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-interactionClosesAt" className={FORM_LABEL_CLASS}>
            Comments & votes close
          </Label>
          <Input
            id="edit-interactionClosesAt"
            type="datetime-local"
            className="h-10 w-full text-sm rounded-lg"
            value={interactionClosesAt ? toDatetimeLocal(interactionClosesAt) : ""}
            onChange={(e) => {
              const v = e.target.value;
              setValue("interactionClosesAt", v ? new Date(v) : undefined as unknown as Date, {
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
        </div>
      </div>

      {(errors.root ?? error) && (
        <p
          className={FORM_ERROR_BLOCK_CLASS}
          role="alert"
          aria-live="polite"
        >
          {errors.root?.message ??
            getErrorMessage(error, "Failed to update submission cycle. Please try again.")}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-border/80 pt-6">
        <Button type="submit" disabled={isPending} className="h-10 rounded-lg px-5 text-sm font-medium">
          {isPending ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending} className="h-10 rounded-lg px-5 text-sm font-medium">
          Cancel
        </Button>
      </div>
    </form>
  );
}
