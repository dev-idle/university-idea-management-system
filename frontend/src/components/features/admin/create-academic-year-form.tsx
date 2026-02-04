"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreateAcademicYearBody,
  CreateAcademicYearFormValues,
} from "@/lib/schemas/academic-years.schema";
import { createAcademicYearFormSchema } from "@/lib/schemas/academic-years.schema";
import { getErrorMessage } from "@/lib/errors";
import { FORM_ERROR_BLOCK_CLASS } from "./constants";
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
  } = useForm<CreateAcademicYearFormValues>({
    resolver: zodResolver(createAcademicYearFormSchema),
    defaultValues: {
      name: "2026-2027",
      startDate: "",
      endDate: "",
    },
  });

  async function onSubmit(data: CreateAcademicYearFormValues) {
    try {
      const body: CreateAcademicYearBody = {
        name: data.name,
        startDate: new Date(data.startDate),
        ...(data.endDate && data.endDate !== "" ? { endDate: new Date(data.endDate) } : {}),
      };
      await mutateAsync(body);
      onSuccess();
    } catch (e) {
      const message = getErrorMessage(e, "Failed to create academic year. Please try again.");
      const isDuplicateName =
        message.toLowerCase().includes("already exists") &&
        (message.toLowerCase().includes("name") || message.toLowerCase().includes("year"));
      if (isDuplicateName) {
        setError("name", { type: "server", message });
      } else {
        setError("root", { type: "server", message });
      }
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
            placeholder="e.g. 2026-2027"
            className="h-10 w-full text-sm rounded-lg"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Use format YYYY-YYYY (e.g. 2026-2027). Names must be unique.
          </p>
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
      {(errors.root ?? error) && !errors.name && (
        <p
          className={FORM_ERROR_BLOCK_CLASS}
          role="alert"
          aria-live="polite"
        >
          {getErrorMessage(errors.root ?? error, "Failed to create academic year. Please try again.")}
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
