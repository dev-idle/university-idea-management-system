"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  AcademicYear,
  UpdateAcademicYearBody,
} from "@/lib/schemas/academic-years.schema";
import { updateAcademicYearFormSchema } from "@/lib/schemas/academic-years.schema";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
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
  error: Error | null;
  /** When "dialog", no card wrapper or title; use inside a Dialog. */
  variant?: "default" | "dialog";
}

export function UpdateAcademicYearForm({
  academicYear,
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
  variant = "default",
}: UpdateAcademicYearFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UpdateAcademicYearBody>({
    resolver: zodResolver(updateAcademicYearFormSchema),
    defaultValues: {
      name: academicYear.name,
      startDate: toInputDate(academicYear.startDate),
      endDate: academicYear.endDate ? toInputDate(academicYear.endDate) : "",
      isActive: academicYear.isActive,
    },
  });

  async function onSubmit(data: UpdateAcademicYearBody) {
    try {
      await mutateAsync({
        id: academicYear.id,
        body: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.startDate !== undefined && { startDate: data.startDate }),
          ...(data.endDate !== undefined && { endDate: data.endDate }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });
      onSuccess();
    } catch (e) {
      setError("root", {
        message: getErrorMessage(e, "Failed to update academic year. Please try again."),
      });
    }
  }

  const labelClass =
    "text-muted-foreground text-[11px] font-medium uppercase tracking-[0.12em]";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={variant === "dialog" ? "flex flex-col gap-6" : "flex flex-col gap-6 rounded-xl border border-border/90 bg-card p-6 shadow-sm"}
    >
      {variant === "default" && (
        <div>
          <h3 className="font-serif text-base font-semibold tracking-tight text-foreground">
            Edit academic year
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Update name, dates, or active status. Exactly one year can be active at a time.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="edit-name" className={labelClass}>
            Name
          </Label>
          <Input
            id="edit-name"
            type="text"
            placeholder="e.g. 2024–2025"
            className="h-10 w-full text-sm rounded-lg"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "edit-name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="edit-name-error" className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="min-w-0 space-y-2">
          <Label htmlFor="edit-startDate" className={labelClass}>
            Start date
          </Label>
          <Input
            id="edit-startDate"
            type="date"
            className="h-10 w-full text-sm rounded-lg"
            aria-invalid={!!errors.startDate}
            aria-describedby={errors.startDate ? "edit-startDate-error" : undefined}
            {...register("startDate")}
          />
          {errors.startDate && (
            <p id="edit-startDate-error" className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.startDate.message}
            </p>
          )}
        </div>
        <div className="min-w-0 space-y-2">
          <Label htmlFor="edit-endDate" className={labelClass}>
            End date{" "}
            <span className="font-normal normal-case text-muted-foreground/80">
              (optional)
            </span>
          </Label>
          <Input
            id="edit-endDate"
            type="date"
            className="h-10 w-full text-sm rounded-lg"
            aria-invalid={!!errors.endDate}
            aria-describedby={errors.endDate ? "edit-endDate-error" : undefined}
            {...register("endDate")}
          />
          {errors.endDate && (
            <p id="edit-endDate-error" className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.endDate.message}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <input
            type="checkbox"
            id="edit-isActive"
            {...register("isActive")}
            className="size-4 rounded border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-describedby="edit-isActive-desc"
          />
          <Label
            id="edit-isActive-desc"
            htmlFor="edit-isActive"
            className="cursor-pointer text-sm text-muted-foreground"
          >
            Active (exactly one year can be active)
          </Label>
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
          {isPending ? "Saving…" : "Save"}
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
