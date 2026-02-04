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
  submissionCycles: {
    all: ["api", "submission-cycles"] as const,
    list: () => [...queryKeys.submissionCycles.all, "list"] as const,
    detail: (id: string) => [...queryKeys.submissionCycles.all, "detail", id] as const,
  },
  profile: {
    all: ["api", "me"] as const,
    me: () => [...queryKeys.profile.all, "me"] as const,
  },
  ideas: {
    all: ["api", "ideas"] as const,
    list: (params?: { page: number; limit: number; sort?: string }) =>
      [...queryKeys.ideas.all, "list", params ?? {}] as const,
    detail: (id: string) => [...queryKeys.ideas.all, "detail", id] as const,
    context: () => [...queryKeys.ideas.all, "context"] as const,
    uploadParams: () => [...queryKeys.ideas.all, "upload-params"] as const,
    comments: (ideaId: string) => [...queryKeys.ideas.all, "detail", ideaId, "comments"] as const,
  },
} as const;
