"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type {
  AcademicYear,
  AcademicYearsListWithContext,
  CreateAcademicYearBody,
  UpdateAcademicYearBody,
} from "@/lib/schemas/academic-years.schema";
import { academicYearsListWithContextSchema } from "@/lib/schemas/academic-years.schema";

function parseAcademicYearsList(data: unknown): AcademicYearsListWithContext {
  const parsed = academicYearsListWithContextSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid academic years response");
  return parsed.data;
}

/** List academic years. Backend enforces ACADEMIC_YEARS permission; exactly one active. */
export function useAcademicYearsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.academicYears.list(),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>("academic-years");
      return parseAcademicYearsList(data);
    },
    enabled: options?.enabled !== false,
  });
}

/** Create academic year. Backend enforces ACADEMIC_YEARS permission. */
export function useCreateAcademicYearMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateAcademicYearBody) => {
      const res = await fetchWithAuth<AcademicYear>("academic-years", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return res as AcademicYear;
    },
    onSuccess: (created) => {
      queryClient.setQueryData(queryKeys.academicYears.list(), (old: AcademicYearsListWithContext | undefined) => {
        if (!old) return { list: [created], hasActiveSubmissionCycleInSystem: false };
        return { ...old, list: [created, ...old.list] };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    },
  });
}

/** Update academic year (name, dates, isActive). Setting isActive=true deactivates others. */
export function useUpdateAcademicYearMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: { id: string; body: UpdateAcademicYearBody }) => {
      const res = await fetchWithAuth<AcademicYear>(`academic-years/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return res as AcademicYear;
    },
    onMutate: async ({ id, body }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.academicYears.list() });
      const prev = queryClient.getQueryData<AcademicYearsListWithContext>(queryKeys.academicYears.list());
      if (prev?.list && body.isActive !== undefined) {
        queryClient.setQueryData(queryKeys.academicYears.list(), {
          ...prev,
          list: prev.list.map((y) =>
            y.id === id ? { ...y, isActive: body.isActive! } : body.isActive ? { ...y, isActive: false } : y
          ),
        });
      }
      return { prev };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.academicYears.list(), (old: AcademicYearsListWithContext | undefined) => {
        if (!old?.list) return old;
        return {
          ...old,
          list: old.list.map((y) => (y.id === updated.id ? updated : y)),
        };
      });
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev != null) {
        queryClient.setQueryData(queryKeys.academicYears.list(), ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    },
  });
}

/** Delete academic year. Fails if active or has proposal cycles. Backend enforces ACADEMIC_YEARS permission. */
export function useDeleteAcademicYearMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchWithAuth(`academic-years/${id}`, { method: "DELETE" });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.academicYears.list() });
      const prev = queryClient.getQueryData<AcademicYearsListWithContext>(queryKeys.academicYears.list());
      if (prev?.list) {
        queryClient.setQueryData(queryKeys.academicYears.list(), {
          ...prev,
          list: prev.list.filter((y) => y.id !== id),
        });
      }
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev != null) {
        queryClient.setQueryData(queryKeys.academicYears.list(), ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    },
  });
}
