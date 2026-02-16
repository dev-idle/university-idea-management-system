"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import type { CreateUserBody } from "@/lib/schemas/users.schema";
import { createUserBodySchema } from "@/lib/schemas/users.schema";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import {
  FORM_ACTIONS_CLASS,
  FORM_ACTIONS_DIALOG_CLASS,
  FORM_BUTTON_CLASS,
  FORM_OUTLINE_BUTTON_CLASS,
  FORM_DIALOG_FORM_CLASS,
  FORM_DIALOG_LABEL_CLASS,
  FORM_DIALOG_INPUT_CLASS,
  FORM_DIALOG_FIELD_WRAPPER_CLASS,
  FORM_DIALOG_SELECT_TRIGGER_CLASS,
  FORM_CARD_INPUT_CLASS,
  FORM_CARD_SELECT_TRIGGER_CLASS,
  FORM_DIALOG_HINT_CLASS,
  FORM_DIALOG_ROOT_ERROR_CLASS,
  FORM_HINT_CLASS,
  FORM_FIELD_ERROR_CLASS,
  QA_COORDINATOR_CONFLICT_MESSAGE,
  EMAIL_ALREADY_EXISTS_MESSAGE,
} from "./constants";
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
      const message = getErrorMessage(e, ERROR_FALLBACK_FORM.createUser);
      const lower = message.toLowerCase().replace(/\s+/g, " ");
      if (
        (lower.includes("qa coordinator") && lower.includes("department")) ||
        lower.includes("already has a qa coordinator")
      ) {
        setError("departmentId", {
          type: "server",
          message: QA_COORDINATOR_CONFLICT_MESSAGE,
        });
      } else if (lower.includes("email") && (lower.includes("already exists") || lower.includes("exists"))) {
        setError("email", { type: "server", message: EMAIL_ALREADY_EXISTS_MESSAGE });
      } else if (lower.includes("department") && lower.includes("not found")) {
        setError("departmentId", { type: "server", message });
      } else if (lower.includes("role") && lower.includes("not found")) {
        setError("role", { type: "server", message });
      } else {
        setError("root", { type: "server", message });
      }
    }
  }

  const isDialog = variant === "dialog";

  const labelClass = isDialog
    ? FORM_DIALOG_LABEL_CLASS
    : "text-muted-foreground text-[11px] font-medium uppercase tracking-[0.12em]";
  const inputClass = isDialog ? FORM_DIALOG_INPUT_CLASS : FORM_CARD_INPUT_CLASS;
  const triggerClass = isDialog ? FORM_DIALOG_SELECT_TRIGGER_CLASS : FORM_CARD_SELECT_TRIGGER_CLASS;
  const fieldWrapperClass = isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "min-w-0 space-y-2";
  const fieldErrorClass = FORM_FIELD_ERROR_CLASS;
  const formActionsClass = isDialog ? FORM_ACTIONS_DIALOG_CLASS : FORM_ACTIONS_CLASS;

  const formContent = (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={isDialog ? FORM_DIALOG_FORM_CLASS : "space-y-6"}
    >
      {variant === "default" && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Create an institutional account. All fields are required except full name.
        </p>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className={fieldWrapperClass}>
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
            className={inputClass}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p id="fullName-error" className={fieldErrorClass} role="alert">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className={fieldWrapperClass}>
          <Label htmlFor="email" className={labelClass}>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="user@gre.ac.uk"
            className={inputClass}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className={fieldErrorClass} role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className={fieldWrapperClass}>
          <Label htmlFor="password" className={labelClass}>
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputClass}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error" className={fieldErrorClass} role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className={fieldWrapperClass}>
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
            <p id="role-error" className={fieldErrorClass} role="alert">
              {errors.role.message}
            </p>
          )}
        </div>

        <div className={fieldWrapperClass}>
          <Label htmlFor="departmentId" className={labelClass}>
            Department
          </Label>
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => {
              const selectedDepartment = departments?.find((d) => d.id === field.value);
              const roleIsQaCoordinator = watch("role") === "QA_COORDINATOR";
              const hintId = "departmentId-qa-hint";
              const describedBy = errors.departmentId
                ? "departmentId-error"
                : roleIsQaCoordinator
                  ? hintId
                  : undefined;
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
                    aria-describedby={describedBy}
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
            <p id="departmentId-error" className={fieldErrorClass} role="alert">
              {errors.departmentId.message}
            </p>
          )}
          {departmentsError && !errors.departmentId && (
            <p className={isDialog ? FORM_DIALOG_HINT_CLASS : FORM_HINT_CLASS}>
              Departments unavailable.
            </p>
          )}
        </div>
      </div>

      {(errors.root ?? error) && (
        <p
          className={FORM_DIALOG_ROOT_ERROR_CLASS}
          role="alert"
          aria-live="polite"
        >
          {errors.root?.message ??
            getErrorMessage(error, ERROR_FALLBACK_FORM.createUser)}
        </p>
      )}

      <div className={formActionsClass}>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className={FORM_OUTLINE_BUTTON_CLASS}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className={FORM_BUTTON_CLASS}
        >
          {isPending ? "Adding…" : "Add"}
        </Button>
      </div>
    </form>
  );

  if (variant === "dialog") {
    return formContent;
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-border/80 bg-card py-0 shadow-sm">
      <CardHeader className="border-b border-border/80 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/30 text-muted-foreground/90">
            <UserPlus className="size-4" strokeWidth={1.25} aria-hidden />
          </div>
          <CardTitle className="font-sans text-base font-semibold tracking-tight text-foreground">
            Add User
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-5">
        {formContent}
      </CardContent>
    </Card>
  );
}
