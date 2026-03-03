"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type { UsersListResponse, UserListItem } from "@/lib/schemas/users.schema";
import { usersListResponseSchema } from "@/lib/schemas/users.schema";
import type { Department } from "@/lib/schemas/departments.schema";
import { departmentsListResponseSchema } from "@/lib/schemas/departments.schema";
import type { AcademicYearsListWithContext } from "@/lib/schemas/academic-years.schema";
import { academicYearsListWithContextSchema } from "@/lib/schemas/academic-years.schema";

/** Department names excluded from compliance rules (internal/system depts). Mirrors backend. */
const EXCLUDED_DEPARTMENT_NAMES = new Set([
  "IT Services / System Administration Department",
  "Quality Assurance Office",
]);

export type AdminDashboardStats = {
  totalUsers: number;
  usersByRole: Record<string, number>;
  departments: Department[];
  departmentCount: number;
  activeAcademicYear: { id: string; name: string } | null;
  /** In active year: non-active cycles (DRAFT/CLOSED) with 1+ ideas, active cycles with 1+ ideas. */
  activeYearCycleStats: {
    nonActiveWithIdeas: number;
    activeWithIdeas: number;
  } | null;
  academicYearsCount: number;
  /** Each department: has exactly 1 QA Coordinator and >= 1 Staff. Excluded depts have isExcluded=true. */
  departmentCompliance: Array<{
    id: string;
    name: string;
    hasQaCoordinator: boolean;
    staffCount: number;
    status: "ok" | "missing_qc" | "missing_staff" | "missing_both";
    isExcluded: boolean;
  }>;
  /** Users grouped by departmentId. Users without department are in key "". */
  usersByDepartment: Record<string, UserListItem[]>;
};

const PAGE_SIZE = 100;

function parseUsersResponse(data: unknown): UsersListResponse {
  const parsed = usersListResponseSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid users list response");
  return parsed.data;
}

function parseDepartments(data: unknown): Department[] {
  const parsed = departmentsListResponseSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid departments response");
  return parsed.data;
}

function parseAcademicYears(data: unknown): AcademicYearsListWithContext {
  const parsed = academicYearsListWithContextSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid academic years response");
  return parsed.data;
}

/** Derive primary role from user (backend: one role per user). */
function getPrimaryRole(user: UserListItem): string {
  const roles = user.roles ?? [];
  return roles[0] ?? "STAFF";
}

/** Fetch all users by paginating. Required for accurate role counts and department compliance. */
async function fetchAllUsers(): Promise<UserListItem[]> {
  const first = await fetchWithAuth<unknown>(`users?page=1&limit=${PAGE_SIZE}`);
  const firstParsed = parseUsersResponse(first);
  const all: UserListItem[] = [...firstParsed.data];
  const total = firstParsed.total;

  if (total <= PAGE_SIZE) return all;

  const remainingPages = Math.ceil(total / PAGE_SIZE) - 1;
  const pagePromises = Array.from({ length: remainingPages }, (_, i) =>
    fetchWithAuth<unknown>(`users?page=${i + 2}&limit=${PAGE_SIZE}`)
  );
  const pages = await Promise.all(pagePromises);
  for (const p of pages) {
    const parsed = parseUsersResponse(p);
    all.push(...parsed.data);
  }
  return all;
}

export function useAdminDashboardStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.admin.dashboardStats(),
    queryFn: async (): Promise<AdminDashboardStats> => {
      const [users, departmentsRaw, academicYearsRaw] = await Promise.all([
        fetchAllUsers(),
        fetchWithAuth<unknown>("departments"),
        fetchWithAuth<unknown>("academic-years"),
      ]);

      const departments = parseDepartments(departmentsRaw);
      const academicYears = parseAcademicYears(academicYearsRaw);
      const activeYear = academicYears.list.find((y) => y.isActive) ?? null;

      const usersByRole: Record<string, number> = {};
      for (const user of users) {
        const role = getPrimaryRole(user);
        usersByRole[role] = (usersByRole[role] ?? 0) + 1;
      }

      const deptStats = new Map<
        string,
        { qaCoordinatorCount: number; staffCount: number; name: string }
      >();
      for (const d of departments) {
        deptStats.set(d.id, { qaCoordinatorCount: 0, staffCount: 0, name: d.name });
      }
      for (const user of users) {
        const deptId = user.departmentId;
        if (!deptId) continue;
        const stats = deptStats.get(deptId);
        if (!stats) continue;
        const role = getPrimaryRole(user);
        if (role === "QA_COORDINATOR" && user.isActive) stats.qaCoordinatorCount += 1;
        if (role === "STAFF") stats.staffCount += 1;
      }

      const departmentCompliance = departments.map((d) => {
        const isExcluded = EXCLUDED_DEPARTMENT_NAMES.has(d.name);
        const stats = deptStats.get(d.id) ?? {
          qaCoordinatorCount: 0,
          staffCount: 0,
          name: d.name,
        };
        const hasQC = stats.qaCoordinatorCount === 1;
        const hasStaff = stats.staffCount >= 1;
        let status: "ok" | "missing_qc" | "missing_staff" | "missing_both" = "ok";
        if (!isExcluded) {
          if (!hasQC && !hasStaff) status = "missing_both";
          else if (!hasQC) status = "missing_qc";
          else if (!hasStaff) status = "missing_staff";
        }

        return {
          id: d.id,
          name: d.name,
          hasQaCoordinator: hasQC,
          staffCount: stats.staffCount,
          status,
          isExcluded,
        };
      });

      const usersByDepartment: Record<string, UserListItem[]> = {};
      for (const d of departments) {
        usersByDepartment[d.id] = users.filter((u) => u.departmentId === d.id);
      }

      const activeYearCycleStats = activeYear
        ? {
            nonActiveWithIdeas: activeYear.nonActiveCyclesWithIdeasCount ?? 0,
            activeWithIdeas: activeYear.activeCyclesWithIdeasCount ?? 0,
          }
        : null;

      return {
        totalUsers: users.length,
        usersByRole,
        departments,
        departmentCount: departments.length,
        activeAcademicYear: activeYear ? { id: activeYear.id, name: activeYear.name } : null,
        activeYearCycleStats,
        academicYearsCount: academicYears.list.length,
        departmentCompliance,
        usersByDepartment,
      };
    },
    enabled: options?.enabled !== false,
  });
}
