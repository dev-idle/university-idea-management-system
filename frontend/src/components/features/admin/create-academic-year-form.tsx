"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateAcademicYearBody } from "@/lib/schemas/academic-years.schema";
import { createAcademicYearBodySchema } from "@/lib/schemas/academic-years.schema";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateAcademicYearFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (body: CreateAcademicYearBody) => Promise<unknown>;
  error: Error | null;
  /** When "dialog", renders form only (no card); use inside a Dialog. */
  variant?: "default" | "dialog";
}

export function CreateAcademicYearForm({
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
  variant = "default",
}: CreateAcademicYearFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateAcademicYearBody>({
    resolver: zodResolver(createAcademicYearBodySchema),
    defaultValues: {
      name: "",
      startDate: undefined,
      endDate: undefined,
    },
  });

  async function onSubmit(data: CreateAcademicYearBody) {
    try {
      await mutateAsync(data);
      onSuccess();
    } catch (e) {
      setError("root", {
        message: getErrorMessage(e, "Failed to create academic year. Please try again."),
      });
    }
  }

  const labelClass =
    "text-muted-foreground text-[11px] font-medium uppercase tracking-[0.12em]";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={
        variant === "dialog"
          ? "space-y-6"
          : "space-y-6 rounded-xl border border-border/90 bg-card px-6 py-6 shadow-sm"
      }
    >
      {variant === "default" && (
        <div>
          <h2 className="font-serif text-base font-semibold tracking-tight text-foreground">
            Add academic year
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Define a new academic year with name and date range. Exactly one year can be active at a time.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="name" className={labelClass}>
            Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. 2024–2025"
            className="h-10 w-full text-sm rounded-lg"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="name-error" className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="min-w-0 space-y-2">
          <Label htmlFor="startDate" className={labelClass}>
            Start date
          </Label>
          <Input
            id="startDate"
            type="date"
            className="h-10 w-full text-sm rounded-lg"
            aria-invalid={!!errors.startDate}
            aria-describedby={errors.startDate ? "startDate-error" : undefined}
            {...register("startDate")}
          />
          {errors.startDate && (
            <p id="startDate-error" className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.startDate.message}
            </p>
          )}
        </div>
        <div className="min-w-0 space-y-2">
          <Label htmlFor="endDate" className={labelClass}>
            End date{" "}
            <span className="font-normal normal-case text-muted-foreground/80">
              (optional)
            </span>
          </Label>
          <Input
            id="endDate"
            type="date"
            className="h-10 w-full text-sm rounded-lg"
            aria-invalid={!!errors.endDate}
            aria-describedby={errors.endDate ? "endDate-error" : undefined}
            {...register("endDate")}
          />
          {errors.endDate && (
            <p id="endDate-error" className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>
      {(errors.root ?? error) && (
        <p
          className="rounded-lg border-l-4 border-destructive/50 border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm leading-relaxed text-destructive"
          role="alert"
          aria-live="polite"
        >
          {errors.root?.message ?? error?.message}
        </p>
      )}
      <div className="flex flex-wrap gap-3 border-t border-border/80 pt-6">
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-lg px-5 text-sm font-medium"
        >
          {isPending ? "Creating…" : "Create academic year"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="h-10 rounded-lg px-5 text-sm font-medium"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
