"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import type { CreateUserBody } from "@/lib/schemas/users.schema";
import { createUserBodySchema } from "@/lib/schemas/users.schema";
import { getErrorMessage } from "@/lib/errors";
import { FORM_ERROR_BLOCK_CLASS } from "./constants";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/rbac";
import { useDepartmentsQuery } from "@/hooks/use-departments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (body: CreateUserBody) => Promise<unknown>;
  error: Error | null;
  /** When "dialog", renders form only (no Card); use inside a Dialog. */
  variant?: "default" | "dialog";
}

export function CreateUserForm({
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
  variant = "default",
}: CreateUserFormProps) {
  const { data: departments, isError: departmentsError } = useDepartmentsQuery();

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<CreateUserBody>({
    resolver: zodResolver(createUserBodySchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      role: "STAFF",
      departmentId: "",
    },
  });

  async function onSubmit(data: CreateUserBody) {
    const payload: CreateUserBody = {
      ...data,
      fullName: data.fullName?.trim() || undefined,
      departmentId: data.departmentId,
    };
    try {
      await mutateAsync(payload);
      onSuccess();
    } catch (e) {
      setError("root", {
        message: getErrorMessage(e, "Failed to create user. Please try again."),
      });
    }
  }

  const hasError = !!errors.root || !!error;

  const labelClass =
    "text-muted-foreground text-[11px] font-medium uppercase tracking-[0.12em]";
  const triggerClass =
    "!h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>[data-slot=select-value]]:min-w-0 [&>[data-slot=select-value]]:truncate";

  const formContent = (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      aria-describedby={hasError ? "create-user-form-error" : undefined}
    >
      {variant === "default" && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Create an institutional account. All fields except full name are required.
        </p>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="fullName" className={labelClass}>
            Full name{" "}
            <span className="font-normal normal-case text-muted-foreground/80">
              (optional)
            </span>
          </Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            className="h-10 w-full text-sm rounded-lg"
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p id="fullName-error" className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="min-w-0 space-y-2">
          <Label htmlFor="email" className={labelClass}>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="user@gre.ac.uk"
            className="h-10 w-full text-sm rounded-lg"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="min-w-0 space-y-2">
          <Label htmlFor="password" className={labelClass}>
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="h-10 w-full text-sm rounded-lg"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error" className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="min-w-0 space-y-2">
          <Label htmlFor="role" className={labelClass}>
            Role
          </Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                name={field.name}
              >
                <SelectTrigger
                  id="role"
                  className={triggerClass}
                  aria-invalid={!!errors.role}
                  aria-describedby={errors.role ? "role-error" : undefined}
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r as Role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && (
            <p id="role-error" className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.role.message}
            </p>
          )}
        </div>

        <div className="min-w-0 space-y-2">
          <Label htmlFor="departmentId" className={labelClass}>
            Department
          </Label>
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => {
              const selectedDepartment = departments?.find((d) => d.id === field.value);
              return (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  name={field.name}
                >
                  <SelectTrigger
                    id="departmentId"
                    className={triggerClass}
                    aria-invalid={!!errors.departmentId}
                    aria-describedby={errors.departmentId ? "departmentId-error" : undefined}
                    title={selectedDepartment?.name}
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                <SelectContent>
                  {departments?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      <span className="block truncate" title={d.name}>
                        {d.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              );
            }}
          />
          {errors.departmentId && (
            <p id="departmentId-error" className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.departmentId.message}
            </p>
          )}
          {departmentsError && !errors.departmentId && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Departments unavailable. Please try again later.
            </p>
          )}
          {watch("role") === "QA_COORDINATOR" && !errors.departmentId && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Each department can have only one QA Coordinator.
            </p>
          )}
        </div>
      </div>

      {(errors.root ?? error) && (
        <p
          id="create-user-form-error"
          className={FORM_ERROR_BLOCK_CLASS}
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
          {isPending ? "Creating…" : "Create user"}
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

  if (variant === "dialog") {
    return formContent;
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-border/90 bg-card py-0 shadow-sm">
      <CardHeader className="border-b border-border/80 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
            <UserPlus className="size-4" strokeWidth={1.25} aria-hidden />
          </div>
          <CardTitle className="font-serif text-base font-semibold tracking-tight text-foreground">
            Add user
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-5">
        {formContent}
      </CardContent>
    </Card>
  );
}
