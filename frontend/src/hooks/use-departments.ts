"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type {
  Department,
  CreateDepartmentBody,
  UpdateDepartmentBody,
} from "@/lib/schemas/departments.schema";
import { departmentsListResponseSchema } from "@/lib/schemas/departments.schema";

export type DepartmentOption = Department;

function parseDepartmentsList(data: unknown): Department[] {
  const parsed = departmentsListResponseSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid departments response");
  return parsed.data;
}

/** List departments. Backend enforces DEPARTMENTS permission. */
export function useDepartmentsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.departments.list(),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>("departments");
      return parseDepartmentsList(data);
    },
    enabled: options?.enabled !== false,
  });
}

/** Create department. Backend enforces DEPARTMENTS permission. */
export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateDepartmentBody) => {
      const res = await fetchWithAuth<Department>("departments", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return res as Department;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
    },
  });
}

/** Update department. Backend enforces DEPARTMENTS permission. */
export function useUpdateDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: { id: string; body: UpdateDepartmentBody }) => {
      const res = await fetchWithAuth<Department>(`departments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return res as Department;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
    },
  });
}
