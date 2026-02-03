import { z } from "zod";

/**
 * Category schemas (Zod). Aligned with backend DTOs; client-side validation only.
 * Backend enforces QA_MANAGER role and duplicate-name / in-use constraints.
 */

export const createCategoryBodySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required.")
    .max(255, "Category name must not exceed 255 characters."),
});

export type CreateCategoryBody = z.infer<typeof createCategoryBodySchema>;

export const updateCategoryBodySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required.")
    .max(255, "Category name must not exceed 255 characters.")
    .optional(),
});

export type UpdateCategoryBody = z.infer<typeof updateCategoryBodySchema>;

/** Single category (API response). List may include _count for UI (delete disabled when used by ideas or submission cycles). */
export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  _count: z
    .object({
      ideas: z.number().int().min(0),
      cycleCategories: z.number().int().min(0).optional(),
    })
    .optional(),
});

export type Category = z.infer<typeof categorySchema>;

export const categoriesListResponseSchema = z.array(categorySchema);

export type CategoriesListResponse = z.infer<typeof categoriesListResponseSchema>;
