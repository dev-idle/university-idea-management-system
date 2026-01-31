"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateAcademicYearBody } from "@/lib/schemas/academic-years.schema";
import { createAcademicYearBodySchema } from "@/lib/schemas/academic-years.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateAcademicYearFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (body: CreateAcademicYearBody) => Promise<unknown>;
  error: Error | null;
}

export function CreateAcademicYearForm({
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
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
      const message = e instanceof Error ? e.message : "Failed to create academic year";
      setError("root", { message });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-lg border border-border bg-card p-6 space-y-4"
    >
      <h2 className="text-lg font-semibold text-foreground">Add academic year</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. 2024–2025"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input id="startDate" type="date" {...register("startDate")} />
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End date (optional)</Label>
          <Input id="endDate" type="date" {...register("endDate")} />
          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
          )}
        </div>
      </div>
      {errors.root && (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create academic year"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
