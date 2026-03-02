"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import {
  profileSchema,
  departmentMembersSchema,
  departmentStatsSchema,
  departmentChartsSchema,
  qaManagerStatsSchema,
  qaManagerChartsSchema,
  type Profile,
  type DepartmentMembers,
  type DepartmentStats,
  type DepartmentCharts,
  type QaManagerStats,
  type QaManagerCharts,
} from "@/lib/schemas/profile.schema";
import { useAuthStore } from "@/stores/auth.store";

function parseProfile(data: unknown): Profile {
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid profile response");
  return parsed.data;
}

function parseDepartmentMembers(data: unknown): DepartmentMembers {
  const parsed = departmentMembersSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid department members response");
  return parsed.data;
}

function parseDepartmentStats(data: unknown): DepartmentStats {
  const parsed = departmentStatsSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid department stats response");
  return parsed.data;
}

function parseDepartmentCharts(data: unknown): DepartmentCharts {
  const parsed = departmentChartsSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid department charts response");
  return parsed.data;
}

/**
 * TanStack Query: fetch GET /me with Bearer token and silent refresh on 401.
 * Do NOT store profile in Zustand; auth store holds token + minimal user only.
 */
export function useProfileQuery(options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  return useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>("me");
      return parseProfile(data);
    },
    enabled: options?.enabled !== false && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * TanStack Query: fetch GET /me/department-members.
 * Returns null if user has no department.
 */
export function useDepartmentMembersQuery(options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  return useQuery({
    queryKey: queryKeys.profile.departmentMembers(),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>("me/department-members");
      return parseDepartmentMembers(data);
    },
    enabled: options?.enabled !== false && isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * TanStack Query: fetch GET /me/department-stats (QA Coordinator only).
 * Returns null if user has no department. Stats scope: active academic year.
 */
export function useDepartmentStatsQuery(options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  return useQuery({
    queryKey: queryKeys.profile.departmentStats(),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>("me/department-stats");
      return parseDepartmentStats(data);
    },
    enabled: options?.enabled !== false && isAuthenticated,
    staleTime: 1 * 60 * 1000,
  });
}

function parseQaManagerStats(data: unknown): QaManagerStats {
  const parsed = qaManagerStatsSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid QA Manager stats response");
  return parsed.data;
}

/**
 * TanStack Query: fetch GET /me/qa-manager-stats (QA Manager only).
 * Org-wide stats for active year; excludes IT Services and Quality Assurance Office.
 */
export function useQaManagerStatsQuery(options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  return useQuery({
    queryKey: queryKeys.profile.qaManagerStats(),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>("me/qa-manager-stats");
      return parseQaManagerStats(data);
    },
    enabled: options?.enabled !== false && isAuthenticated,
    staleTime: 1 * 60 * 1000,
  });
}

function parseQaManagerCharts(data: unknown): QaManagerCharts {
  const parsed = qaManagerChartsSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid QA Manager charts response");
  return parsed.data;
}

/**
 * TanStack Query: fetch GET /me/qa-manager-charts (QA Manager only).
 * Chart data: submission rate per department, ideas over time, ideas per department, ideas by category.
 */
export function useQaManagerChartsQuery(options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  return useQuery({
    queryKey: queryKeys.profile.qaManagerCharts(),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>("me/qa-manager-charts");
      return parseQaManagerCharts(data);
    },
    enabled: options?.enabled !== false && isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * TanStack Query: fetch GET /me/department-charts (QA Coordinator only).
 * Returns chart data: ideas by category, ideas over time (daily, 30 days before closure).
 */
export function useDepartmentChartsQuery(options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  return useQuery({
    queryKey: queryKeys.profile.departmentCharts(),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>("me/department-charts");
      return parseDepartmentCharts(data);
    },
    enabled: options?.enabled !== false && isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}
