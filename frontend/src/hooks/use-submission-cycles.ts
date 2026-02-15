"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type {
  SubmissionCycle,
  CreateCycleBody,
  UpdateCycleBody,
} from "@/lib/schemas/submission-cycles.schema";
import { submissionCyclesListResponseSchema } from "@/lib/schemas/submission-cycles.schema";

function parseCyclesList(data: unknown): SubmissionCycle[] {
  const parsed = submissionCyclesListResponseSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid submission cycles response");
  return parsed.data;
}

/** Academic years list for cycle form (QA_MANAGER only). */
export function useSubmissionCycleAcademicYearsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.submissionCycles.all, "options", "academic-years"] as const,
    queryFn: async () => {
      const data = await fetchWithAuth<Array<{ id: string; name: string; startDate: string; endDate: string | null }>>(
        "submission-cycles/options/academic-years"
      );
      return data;
    },
    enabled: options?.enabled !== false,
  });
}

/** List submission cycles. Backend enforces QA_MANAGER role. */
export function useSubmissionCyclesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.submissionCycles.list(),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>("submission-cycles");
      return parseCyclesList(data);
    },
    enabled: options?.enabled !== false,
  });
}

/** Single cycle. Backend enforces QA_MANAGER role. */
export function useSubmissionCycleQuery(id: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.submissionCycles.detail(id ?? ""),
    queryFn: async () => {
      const data = await fetchWithAuth<SubmissionCycle>(`submission-cycles/${id}`);
      return data as SubmissionCycle;
    },
    enabled: (options?.enabled !== false) && !!id,
  });
}

/** Create cycle (DRAFT). Backend enforces QA_MANAGER role. */
export function useCreateSubmissionCycleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateCycleBody) => {
      const res = await fetchWithAuth<SubmissionCycle>("submission-cycles", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return res as SubmissionCycle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.submissionCycles.all });
    },
  });
}

/** Update cycle (DRAFT only). Backend enforces QA_MANAGER role. */
export function useUpdateSubmissionCycleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateCycleBody }) => {
      const res = await fetchWithAuth<SubmissionCycle>(`submission-cycles/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return res as SubmissionCycle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.submissionCycles.all });
    },
  });
}

/** Activate cycle. Backend enforces single-active constraint. */
export function useActivateSubmissionCycleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth<SubmissionCycle>(`submission-cycles/${id}/activate`, {
        method: "POST",
      });
      return res as SubmissionCycle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.submissionCycles.all });
    },
  });
}

/** Deactivate cycle (ACTIVE → DRAFT). Reopens cycle for editing. */
export function useDeactivateSubmissionCycleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth<SubmissionCycle>(`submission-cycles/${id}/deactivate`, {
        method: "POST",
      });
      return res as SubmissionCycle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.submissionCycles.all });
    },
  });
}

/** Lock cycle (Closed only). Disables Edit and Activate. */
export function useLockSubmissionCycleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth<SubmissionCycle>(`submission-cycles/${id}/lock`, {
        method: "POST",
      });
      return res as SubmissionCycle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.submissionCycles.all });
    },
  });
}

/** Unlock cycle. Re-enables Edit and Activate. */
export function useUnlockSubmissionCycleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth<SubmissionCycle>(`submission-cycles/${id}/unlock`, {
        method: "POST",
      });
      return res as SubmissionCycle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.submissionCycles.all });
    },
  });
}

/** Delete cycle. Only DRAFT or CLOSED; backend returns 400 if ACTIVE. */
export function useDeleteSubmissionCycleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await fetchWithAuth<void>(`submission-cycles/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.submissionCycles.all });
    },
  });
}
