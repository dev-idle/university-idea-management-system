/**
 * TanStack Query key factory. Single source of truth for cache keys.
 */

export const queryKeys = {
  all: ["api"] as const,
  auth: {
    all: ["api", "auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  users: {
    all: ["api", "users"] as const,
    list: (params?: { page: number; limit: number; search?: string }) =>
      [...queryKeys.users.all, "list", params ?? {}] as const,
    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,
  },
  departments: {
    all: ["api", "departments"] as const,
    list: () => [...queryKeys.departments.all, "list"] as const,
    detail: (id: string) => [...queryKeys.departments.all, "detail", id] as const,
  },
  academicYears: {
    all: ["api", "academic-years"] as const,
    list: () => [...queryKeys.academicYears.all, "list"] as const,
    detail: (id: string) => [...queryKeys.academicYears.all, "detail", id] as const,
  },
  profile: {
    all: ["api", "me"] as const,
    me: () => [...queryKeys.profile.all, "me"] as const,
  },
} as const;
