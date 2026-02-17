"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UpdateUserBody } from "@/lib/schemas/users.schema";
import { updateUserBodySchema } from "@/lib/schemas/users.schema";
import type { UserListItem } from "@/lib/schemas/users.schema";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import {
  FORM_LABEL_CLASS,
  FORM_DESCRIPTION_CLASS,
  FORM_ERROR_BLOCK_CLASS,
  FORM_BUTTON_CLASS,
  FORM_OUTLINE_BUTTON_CLASS,
  FORM_ACTIONS_CLASS,
  FORM_ACTIONS_DIALOG_CLASS,
  FORM_DIALOG_FORM_CLASS,
  FORM_DIALOG_LABEL_CLASS,
  FORM_DIALOG_INPUT_CLASS,
  FORM_DIALOG_FIELD_WRAPPER_CLASS,
  FORM_DIALOG_SELECT_TRIGGER_CLASS,
  FORM_DIALOG_ROOT_ERROR_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_CARD_INPUT_CLASS,
  FORM_CARD_SELECT_TRIGGER_CLASS,
  FORM_DIALOG_HINT_CLASS,
  FORM_HINT_CLASS,
  QA_COORDINATOR_CONFLICT_MESSAGE,
} from "./constants";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/rbac";
import { useDepartmentsQuery } from "@/hooks/use-departments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditUserFormProps {
  user: UserListItem;
  onSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  mutateAsync: (params: { id: string; body: UpdateUserBody }) => Promise<unknown>;
  error: Error | null;
  /** When "dialog", renders form only; use inside a Dialog. Matches Add User form variant handling. */
  variant?: "default" | "dialog";
}

export function EditUserForm({
  user,
  onSuccess,
  onCancel,
  isPending,
  mutateAsync,
  error,
  variant = "default",
}: EditUserFormProps) {
  const { data: departments, isError: departmentsError } = useDepartmentsQuery();

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<UpdateUserBody>({
    resolver: zodResolver(updateUserBodySchema),
    defaultValues: {
      fullName: user.fullName ?? "",
      newPassword: "",
      role: (user.roles?.[0] as Role) ?? "STAFF",
      departmentId: user.departmentId ?? "",
    },
  });

  async function onSubmit(data: UpdateUserBody) {
    const fullName =
      data.fullName?.trim() === "" ? null : (data.fullName?.trim() ?? null);
    const newPassword =
      data.newPassword?.trim() && data.newPassword.trim().length >= 8
        ? data.newPassword.trim()
        : undefined;
    const currentRole = user.roles?.[0] ?? "STAFF";
    const currentDeptId = user.departmentId ?? "";

    const roleChanged = data.role !== undefined && data.role !== currentRole;
    const deptChanged =
      data.departmentId !== undefined && data.departmentId !== currentDeptId;

    if (
      fullName === (user.fullName ?? null) &&
      !newPassword &&
      !roleChanged &&
      !deptChanged
    ) {
      onCancel();
      return;
    }

    try {
      await mutateAsync({
        id: user.id,
        body: {
          fullName,
          ...(newPassword ? { newPassword } : {}),
          ...(roleChanged && data.role ? { role: data.role } : {}),
          ...(deptChanged && data.departmentId ? { departmentId: data.departmentId } : {}),
        },
      });
      onSuccess();
    } catch (e) {
      const message = getErrorMessage(e, ERROR_FALLBACK_FORM.updateUser);
      const lower = message.toLowerCase().replace(/\s+/g, " ");
      if (
        (lower.includes("qa coordinator") && lower.includes("department")) ||
        lower.includes("already has a qa coordinator")
      ) {
        setError("departmentId", {
          type: "server",
          message: QA_COORDINATOR_CONFLICT_MESSAGE,
        });
      } else {
        setError("root", {
          message: getErrorMessage(e, ERROR_FALLBACK_FORM.updateUser),
        });
      }
    }
  }

  const hasError = !!errors.root;
  const isDialog = variant === "dialog";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={isDialog ? FORM_DIALOG_FORM_CLASS : "space-y-6"}
      aria-describedby={hasError ? "edit-user-form-error" : undefined}
    >
      {variant === "default" && (
        <p className={FORM_DESCRIPTION_CLASS}>
          Update display name, role, department, or reset password. Leave password blank to keep the current one.
        </p>
      )}
      <div className={isDialog ? "space-y-6" : "space-y-6"}>
        <div className={isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "min-w-0 space-y-2"}>
          <Label htmlFor="edit-fullName" className={isDialog ? FORM_DIALOG_LABEL_CLASS : FORM_LABEL_CLASS}>
            Full name{" "}
            <span className="font-normal normal-case text-muted-foreground/80">
              (optional)
            </span>
          </Label>
          <Input
            id="edit-fullName"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            className={isDialog ? FORM_DIALOG_INPUT_CLASS : FORM_CARD_INPUT_CLASS}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "edit-fullName-error" : undefined}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p id="edit-fullName-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className={isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "min-w-0 space-y-2"}>
          <Label htmlFor="edit-role" className={isDialog ? FORM_DIALOG_LABEL_CLASS : FORM_LABEL_CLASS}>
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
                  id="edit-role"
                  className={isDialog ? FORM_DIALOG_SELECT_TRIGGER_CLASS : FORM_CARD_SELECT_TRIGGER_CLASS}
                  aria-invalid={!!errors.role}
                  aria-describedby={errors.role ? "edit-role-error" : undefined}
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
            <p id="edit-role-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.role.message}
            </p>
          )}
        </div>

        <div className={isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "min-w-0 space-y-2"}>
          <Label htmlFor="edit-departmentId" className={isDialog ? FORM_DIALOG_LABEL_CLASS : FORM_LABEL_CLASS}>
            Department
          </Label>
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => {
              const roleIsQaCoordinator = watch("role") === "QA_COORDINATOR";
              const hintId = "edit-departmentId-qa-hint";
              const describedBy = errors.departmentId
                ? "edit-departmentId-error"
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
                    id="edit-departmentId"
                    className={isDialog ? FORM_DIALOG_SELECT_TRIGGER_CLASS : FORM_CARD_SELECT_TRIGGER_CLASS}
                    aria-invalid={!!errors.departmentId}
                    aria-describedby={describedBy}
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
            <p id="edit-departmentId-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.departmentId.message}
            </p>
          )}
          {departmentsError && !errors.departmentId && (
            <p className={isDialog ? FORM_DIALOG_HINT_CLASS : FORM_HINT_CLASS}>
              Departments unavailable.
            </p>
          )}
        </div>

        <div className={isDialog ? FORM_DIALOG_FIELD_WRAPPER_CLASS : "min-w-0 space-y-2"}>
          <Label htmlFor="edit-newPassword" className={isDialog ? FORM_DIALOG_LABEL_CLASS : FORM_LABEL_CLASS}>
            New password{" "}
            <span className="font-normal normal-case text-muted-foreground/80">
              (optional)
            </span>
          </Label>
          <Input
            id="edit-newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Leave blank to keep current"
            className={isDialog ? FORM_DIALOG_INPUT_CLASS : FORM_CARD_INPUT_CLASS}
            aria-invalid={!!errors.newPassword}
            aria-describedby={errors.newPassword ? "edit-newPassword-error" : undefined}
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p id="edit-newPassword-error" className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.newPassword.message}
            </p>
          )}
        </div>
      </div>

      {errors.root && (
        <p
          id="edit-user-form-error"
          className={isDialog ? FORM_DIALOG_ROOT_ERROR_CLASS : FORM_ERROR_BLOCK_CLASS}
          role="alert"
          aria-live="polite"
        >
          {errors.root.message}
        </p>
      )}

      <div className={isDialog ? FORM_ACTIONS_DIALOG_CLASS : FORM_ACTIONS_CLASS}>
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
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
