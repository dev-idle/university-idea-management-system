"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateDepartmentBody } from "@/lib/schemas/departments.schema";
import { createDepartmentBodySchema } from "@/lib/schemas/departments.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateDepartmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (body: CreateDepartmentBody) => Promise<unknown>;
  error: Error | null;
}

export function CreateDepartmentForm({
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
}: CreateDepartmentFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateDepartmentBody>({
    resolver: zodResolver(createDepartmentBodySchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(data: CreateDepartmentBody) {
    try {
      await mutateAsync(data);
      onSuccess();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create department";
      setError("root", { message });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-lg border border-border bg-card p-6 space-y-4"
    >
      <h2 className="text-lg font-semibold text-foreground">Add department</h2>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          autoComplete="organization"
          placeholder="e.g. Computer Science"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      {errors.root && (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create department"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
