"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type {
  Category,
  CreateCategoryBody,
  UpdateCategoryBody,
} from "@/lib/schemas/categories.schema";
import { categoriesListResponseSchema } from "@/lib/schemas/categories.schema";

function parseCategoriesList(data: unknown): Category[] {
  const parsed = categoriesListResponseSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid categories response");
  return parsed.data;
}

/** List categories. Backend enforces QA_MANAGER role. */
export function useCategoriesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>("categories");
      return parseCategoriesList(data);
    },
    enabled: options?.enabled !== false,
  });
}

/** Create category. Backend enforces QA_MANAGER role; duplicate name returns 409. */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateCategoryBody) => {
      const res = await fetchWithAuth<Category>("categories", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return res as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

/** Update category. Backend enforces QA_MANAGER role; duplicate name returns 409. */
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: { id: string; body: UpdateCategoryBody }) => {
      const res = await fetchWithAuth<Category>(`categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return res as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

/** Delete category. Backend returns 409 if category is used by any idea. */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchWithAuth<void>(`categories/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}
