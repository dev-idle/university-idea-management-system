import { z } from "zod";

/** GET /me response — safe profile fields only. */
export const profileSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  gender: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  role: z.string(),
  department: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
});

export type Profile = z.infer<typeof profileSchema>;

/** PATCH /me body — fullName, phone, address, gender, dateOfBirth editable; email is read-only. */
export const updateProfileBodySchema = z.object({
  fullName: z.string().max(255).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(1000).optional(),
  gender: z.string().max(50).optional(),
  dateOfBirth: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")])
    .optional()
    .transform((s) => (s && String(s).trim() ? s : undefined)),
});

export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;

/** Form schema: no transform so react-hook-form resolver types match. Normalize in submit. */
export const updateProfileFormSchema = z.object({
  fullName: z.string().max(255).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(1000).optional(),
  gender: z.string().max(50).optional(),
  dateOfBirth: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")])
    .optional(),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileFormSchema>;

/** PATCH /me/password body. */
export const changePasswordBodySchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required").max(512),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(512),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;

/** GET /me/department-members response — null if user has no department. */
export const departmentMembersSchema = z
  .object({
    department: z.object({ id: z.string(), name: z.string() }),
    members: z.array(
      z.object({
        id: z.string(),
        fullName: z.string().nullable(),
        email: z.string().email(),
        role: z.string(),
      })
    ),
  })
  .nullable();

export type DepartmentMembers = z.infer<typeof departmentMembersSchema>;
