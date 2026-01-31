"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  AcademicYear,
  UpdateAcademicYearBody,
} from "@/lib/schemas/academic-years.schema";
import { updateAcademicYearFormSchema } from "@/lib/schemas/academic-years.schema";
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
}

export function UpdateAcademicYearForm({
  academicYear,
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
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
      const message =
        e instanceof Error ? e.message : "Failed to update academic year";
      setError("root", { message });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded border border-border bg-muted/30 p-4"
    >
      <h3 className="text-sm font-semibold text-foreground">Edit academic year</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="edit-name">Name</Label>
          <Input
            id="edit-name"
            type="text"
            placeholder="e.g. 2024–2025"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="edit-startDate">Start date</Label>
          <Input
            id="edit-startDate"
            type="date"
            {...register("startDate")}
          />
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="edit-endDate">End date (optional)</Label>
          <Input
            id="edit-endDate"
            type="date"
            {...register("endDate")}
          />
          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="edit-isActive"
            {...register("isActive")}
            className="h-4 w-4 rounded border-input"
          />
          <Label htmlFor="edit-isActive" className="cursor-pointer">
            Active (exactly one year can be active)
          </Label>
        </div>
      </div>
      {errors.root && (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
