"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  Department,
  UpdateDepartmentBody,
} from "@/lib/schemas/departments.schema";
import { updateDepartmentBodySchema } from "@/lib/schemas/departments.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UpdateDepartmentFormProps {
  department: Department;
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (params: { id: string; body: UpdateDepartmentBody }) => Promise<unknown>;
  error: Error | null;
}

export function UpdateDepartmentForm({
  department,
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
}: UpdateDepartmentFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UpdateDepartmentBody>({
    resolver: zodResolver(updateDepartmentBodySchema),
    defaultValues: { name: department.name },
  });

  async function onSubmit(data: UpdateDepartmentBody) {
    if (data.name === undefined || data.name === department.name) {
      onCancel();
      return;
    }
    try {
      await mutateAsync({ id: department.id, body: { name: data.name } });
      onSuccess();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update department";
      setError("root", { message });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-wrap items-end gap-3 rounded border border-border bg-muted/30 p-3"
    >
      <div className="min-w-[200px] space-y-1">
        <Label htmlFor="edit-name">Name</Label>
        <Input
          id="edit-name"
          type="text"
          autoComplete="organization"
          placeholder="Department name"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      {errors.root && (
        <p className="text-sm text-destructive w-full">{errors.root.message}</p>
      )}
      {error && (
        <p className="text-sm text-destructive w-full">{error.message}</p>
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
