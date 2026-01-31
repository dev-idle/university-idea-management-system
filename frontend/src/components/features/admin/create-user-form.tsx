"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateUserBody } from "@/lib/schemas/users.schema";
import { createUserBodySchema } from "@/lib/schemas/users.schema";
import { ROLES } from "@/lib/rbac";
import { useDepartmentsQuery } from "@/hooks/use-departments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CreateUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (body: CreateUserBody) => Promise<unknown>;
  error: Error | null;
}

export function CreateUserForm({
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
}: CreateUserFormProps) {
  const { data: departments, isError: departmentsError } = useDepartmentsQuery();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateUserBody>({
    resolver: zodResolver(createUserBodySchema),
    defaultValues: {
      email: "",
      password: "",
      role: "STAFF",
      departmentId: undefined,
    },
  });

  async function onSubmit(data: CreateUserBody) {
    const payload: CreateUserBody = {
      ...data,
      departmentId: data.departmentId === "" ? undefined : data.departmentId ?? undefined,
    };
    try {
      await mutateAsync(payload);
      onSuccess();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create user";
      setError("root", { message });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-lg border border-border bg-card p-6 space-y-4"
    >
      <h2 className="text-lg font-semibold text-foreground">Add user</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="user@university.edu"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            {...register("role")}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="text-sm text-destructive">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="departmentId">Department (optional)</Label>
          <select
            id="departmentId"
            {...register("departmentId")}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            <option value="">— None —</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          {departmentsError && (
            <p className="text-sm text-muted-foreground">
              Departments unavailable (permission or error). You can leave this empty.
            </p>
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
          {isPending ? "Creating…" : "Create user"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
