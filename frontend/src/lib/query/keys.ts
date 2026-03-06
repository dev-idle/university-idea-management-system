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
  categories: {
    all: ["api", "categories"] as const,
    list: () => [...queryKeys.categories.all, "list"] as const,
    detail: (id: string) => [...queryKeys.categories.all, "detail", id] as const,
  },
  export: {
    all: ["api", "export"] as const,
    cycles: () => [...queryKeys.export.all, "cycles"] as const,
    status: (jobId: string) => [...queryKeys.export.all, "status", jobId] as const,
  },
  submissionCycles: {
    all: ["api", "submission-cycles"] as const,
    list: () => [...queryKeys.submissionCycles.all, "list"] as const,
    detail: (id: string) => [...queryKeys.submissionCycles.all, "detail", id] as const,
  },
  profile: {
    all: ["api", "me"] as const,
    me: () => [...queryKeys.profile.all, "me"] as const,
    departmentMembers: () => [...queryKeys.profile.all, "department-members"] as const,
    departmentStats: () => [...queryKeys.profile.all, "department-stats"] as const,
    departmentCharts: () => [...queryKeys.profile.all, "department-charts"] as const,
    qaManagerStats: () => [...queryKeys.profile.all, "qa-manager-stats"] as const,
    qaManagerCharts: () => [...queryKeys.profile.all, "qa-manager-charts"] as const,
    departmentMembersQaManager: () =>
      [...queryKeys.profile.all, "department-members-qa-manager"] as const,
  },
  admin: {
    all: ["api", "admin"] as const,
    dashboardStats: () => [...queryKeys.admin.all, "dashboard-stats"] as const,
  },
  notifications: {
    all: ["api", "notifications"] as const,
    list: (limit?: number) => [...queryKeys.notifications.all, "list", limit ?? 20] as const,
    unreadCount: () => [...queryKeys.notifications.all, "unread-count"] as const,
  },
  ideas: {
    all: ["api", "ideas"] as const,
    list: (params?: { page: number; limit: number; sort?: string; categoryId?: string; cycleId?: string; departmentId?: string }) =>
      [...queryKeys.ideas.all, "list", params ?? {}] as const,
    detail: (id: string) => [...queryKeys.ideas.all, "detail", id] as const,
    context: () => [...queryKeys.ideas.all, "context"] as const,
    uploadParams: () => [...queryKeys.ideas.all, "upload-params"] as const,
    comments: (ideaId: string) => [...queryKeys.ideas.all, "detail", ideaId, "comments"] as const,
    latestComments: (limit: number) => [...queryKeys.ideas.all, "latest-comments", limit] as const,
    my: {
      all: ["api", "ideas", "my"] as const,
      filters: () => ["api", "ideas", "my", "filters"] as const,
      list: (params?: { page: number; limit: number; categoryId?: string; cycleId?: string; academicYearId?: string }) =>
        ["api", "ideas", "my", "list", params ?? {}] as const,
      detail: (id: string) => ["api", "ideas", "my", "detail", id] as const,
    },
  },
} as const;
