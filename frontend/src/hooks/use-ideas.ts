"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type {
  Idea,
  IdeasContext,
  MyIdeasFilters,
  CreateIdeaBody,
  IdeasPaginatedResponse,
  IdeaComment,
  IdeaCommentsResponse,
  CreateCommentBody,
  LatestCommentsResponse,
  OwnIdea,
  OwnIdeasPaginatedResponse,
  UpdateIdeaBody,
} from "@/lib/schemas/ideas.schema";
import {
  ideaSchema,
  ideasPaginatedResponseSchema,
  ideasContextSchema,
  myIdeasFiltersSchema,
  ideaCommentsResponseSchema,
  latestCommentsResponseSchema,
  ownIdeaSchema,
  ownIdeasPaginatedResponseSchema,
} from "@/lib/schemas/ideas.schema";

function parseIdeasContext(data: unknown): IdeasContext {
  const parsed = ideasContextSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid ideas context response");
  return parsed.data;
}

function parseIdeasPaginated(data: unknown): IdeasPaginatedResponse {
  const parsed = ideasPaginatedResponseSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid ideas list response");
  return parsed.data;
}

/** Refetch interval (ms): poll when within 1h of deadline. Final 5s: every 1s. One refetch after it passes. */
function getDeadlineRefetchInterval(deadline: string | Date | null | undefined): number | false {
  if (!deadline) return false;
  const closesAt = new Date(deadline);
  const now = Date.now();
  const msLeft = closesAt.getTime() - now;
  if (msLeft <= 0) return 5_000;
  if (msLeft <= 5_000) return 1_000;
  if (msLeft <= 60_000) return 5_000;
  if (msLeft <= 300_000) return 15_000;
  if (msLeft <= 3_600_000) return 60_000;
  return false;
}

function getContextRefetchInterval(data: IdeasContext | undefined): number | false {
  if (!data?.submissionClosesAt) return false;
  const closesAt = new Date(data.submissionClosesAt);
  const msLeft = closesAt.getTime() - Date.now();
  if (msLeft <= 0 && !data.canSubmit) return false;
  return getDeadlineRefetchInterval(data.submissionClosesAt);
}

/** Context for Ideas Hub: can submit, active cycle, categories, active academic year. STAFF only. */
export function useIdeasContextQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.ideas.context(),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>("ideas/context");
      return parseIdeasContext(data);
    },
    enabled: options?.enabled !== false,
    refetchInterval: (query) => getContextRefetchInterval(query.state.data),
  });
}

export type IdeasListParams = {
  page?: number;
  limit?: number;
  sort?: "latest" | "mostPopular" | "mostViewed" | "latestComments" | "mostComments";
  categoryId?: string;
  cycleId?: string;
  departmentId?: string;
};

/** List ideas for the active academic year with pagination and sort. STAFF only. */
export function useIdeasQuery(params?: IdeasListParams, options?: { enabled?: boolean }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 5;
  const sort = params?.sort ?? "latest";
  const categoryId = params?.categoryId;
  const cycleId = params?.cycleId;
  const departmentId = params?.departmentId;
  return useQuery({
    queryKey: queryKeys.ideas.list({ page, limit, sort, categoryId, cycleId, departmentId }),
    queryFn: async () => {
      const search = new URLSearchParams();
      search.set("page", String(page));
      search.set("limit", String(limit));
      if (sort !== "latest") search.set("sort", sort);
      if (categoryId) search.set("categoryId", categoryId);
      if (cycleId) search.set("cycleId", cycleId);
      if (departmentId) search.set("departmentId", departmentId);
      const data = await fetchWithAuth<unknown>(`ideas?${search.toString()}`);
      return parseIdeasPaginated(data);
    },
    enabled: options?.enabled !== false,
  });
}

function parseIdea(data: unknown): Idea {
  const parsed = ideaSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid idea response");
  return parsed.data;
}

/** Single idea by id (must belong to active academic year). STAFF only. */
export function useIdeaQuery(id: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.ideas.detail(id ?? ""),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>(`ideas/${id}`);
      return parseIdea(data);
    },
    enabled: options?.enabled !== false && !!id,
  });
}

/** Upload params for Cloudinary (signed). STAFF only. Fails if backend has no Cloudinary config. */
export function useUploadParamsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.ideas.uploadParams(),
    queryFn: async () => {
      const data = await fetchWithAuth<{
        cloudName: string;
        apiKey: string;
        timestamp: number;
        signature: string;
        folder: string;
      }>("ideas/upload-params");
      return data;
    },
    enabled: options?.enabled !== false,
    retry: false,
  });
}

export type CloudinaryUploadParams = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

export type IdeaAttachmentRef = {
  cloudinaryPublicId: string;
  secureUrl: string;
  fileName: string;
  mimeType?: string;
  sizeBytes?: number;
};

/**
 * Upload a file via the backend proxy (POST /api/ideas/upload).
 * Avoids CORS "Failed to fetch" when uploading directly from browser to Cloudinary.
 */
export async function uploadFileViaBackend(file: File): Promise<IdeaAttachmentRef> {
  const formData = new FormData();
  formData.append("file", file);

  const data = await fetchWithAuth<IdeaAttachmentRef>("ideas/upload", {
    method: "POST",
    body: formData,
  });
  return data;
}

/** Submit a new idea. Backend enforces active cycle, window, terms. STAFF only. */
export function useCreateIdeaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateIdeaBody) => {
      const res = await fetchWithAuth<Idea>("ideas", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return res as Idea;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.my.filters() });
    },
  });
}

function parseComments(data: unknown): IdeaCommentsResponse {
  const parsed = ideaCommentsResponseSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid comments response");
  return parsed.data;
}

/** Comments for an idea. STAFF only. */
export function useIdeaCommentsQuery(ideaId: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.ideas.comments(ideaId ?? ""),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>(`ideas/${ideaId}/comments`);
      return parseComments(data);
    },
    enabled: (options?.enabled !== false && !!ideaId) ?? !!ideaId,
  });
}

/** Compute optimistic vote state: same button = remove, else set. */
function applyVote(
  idea: Idea,
  value: "up" | "down",
): { voteCounts: { up: number; down: number }; myVote: "up" | "down" | null } {
  const prev = idea.voteCounts ?? { up: 0, down: 0 };
  const prevMy = idea.myVote ?? null;

  if (prevMy === value) {
    // Same button = remove vote
    return {
      voteCounts: {
        up: value === "up" ? Math.max(0, prev.up - 1) : prev.up,
        down: value === "down" ? Math.max(0, prev.down - 1) : prev.down,
      },
      myVote: null,
    };
  }
  // Set/change vote
  let up = prev.up;
  let down = prev.down;
  if (prevMy === "up") up = Math.max(0, up - 1);
  else if (prevMy === "down") down = Math.max(0, down - 1);
  if (value === "up") up += 1;
  else down += 1;
  return { voteCounts: { up, down }, myVote: value };
}

/** Vote on an idea (up or down). One vote per user. Optimistic update for realtime feel. */
export function useVoteIdeaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ideaId,
      value,
    }: {
      ideaId: string;
      value: "up" | "down";
    }) => {
      const res = await fetchWithAuth<Idea>(`ideas/${ideaId}/vote`, {
        method: "POST",
        body: JSON.stringify({ value }),
      });
      return res as Idea;
    },
    onMutate: async ({ ideaId, value }) => {
      queryClient.cancelQueries({ queryKey: queryKeys.ideas.all });
      const prevDetail = queryClient.getQueryData<Idea>(queryKeys.ideas.detail(ideaId));

      queryClient.setQueriesData<Idea | IdeasPaginatedResponse>(
        { queryKey: queryKeys.ideas.all, exact: false },
        (old) => {
          if (!old) return old;
          let idea: Idea | null = null;
          if ("items" in old) {
            idea = (old as IdeasPaginatedResponse).items.find((i) => i.id === ideaId) ?? null;
          } else if ((old as Idea).id === ideaId) {
            idea = old as Idea;
          }
          if (!idea) return old;
          const applied = applyVote(idea, value);
          if ("items" in old) {
            return {
              ...old,
              items: (old as IdeasPaginatedResponse).items.map((i) =>
                i.id === ideaId ? { ...i, voteCounts: applied.voteCounts, myVote: applied.myVote } : i
              ),
            };
          }
          return { ...(old as Idea), voteCounts: applied.voteCounts, myVote: applied.myVote };
        },
      );

      return { prevDetail };
    },
    onError: (_err, { ideaId }, ctx) => {
      if (ctx?.prevDetail) {
        queryClient.setQueryData(queryKeys.ideas.detail(ideaId), ctx.prevDetail);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
      if (data) {
        queryClient.invalidateQueries({ queryKey: queryKeys.ideas.detail(data.id) });
      }
    },
  });
}

/** Create a comment on an idea. Author stored in DB; display anonymous when isAnonymous. STAFF only. */
export function useCreateCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ideaId,
      body,
    }: {
      ideaId: string;
      body: CreateCommentBody;
    }): Promise<IdeaComment> => {
      const res = await fetchWithAuth<IdeaComment>(`ideas/${ideaId}/comments`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      return res;
    },
    onSuccess: (_, { ideaId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.comments(ideaId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.detail(ideaId) });
    },
  });
}

/** Update own comment. STAFF only. */
export function useUpdateCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ideaId,
      commentId,
      content,
    }: { ideaId: string; commentId: string; content: string }): Promise<IdeaComment> => {
      const res = await fetchWithAuth<IdeaComment>(
        `ideas/${ideaId}/comments/${commentId}`,
        { method: "PATCH", body: JSON.stringify({ content }) },
      );
      return res;
    },
    onSuccess: (_, { ideaId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.comments(ideaId) });
    },
  });
}

/** Reveal author of anonymous idea. QA_MANAGER only. */
export async function revealIdeaAuthor(ideaId: string): Promise<{
  fullName: string | null;
  email: string;
} | null> {
  const data = await fetchWithAuth<{ fullName: string | null; email: string } | null>(
    `ideas/${ideaId}/author`,
  );
  return data;
}

/** Delete idea. QA_MANAGER only. */
export function useDeleteIdeaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ideaId: string): Promise<void> => {
      await fetchWithAuth(`ideas/${ideaId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
    },
  });
}

/** Delete own comment. STAFF only. */
export function useDeleteCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ideaId,
      commentId,
    }: { ideaId: string; commentId: string }): Promise<void> => {
      await fetchWithAuth(`ideas/${ideaId}/comments/${commentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_, { ideaId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.comments(ideaId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.detail(ideaId) });
    },
  });
}

/** Compute optimistic like state: same button = remove, else set. */
function applyLikeComment(
  c: IdeaComment,
  value: "up" | "down",
): { likeCount: number; dislikeCount: number; myReaction: "up" | "down" | null } {
  const likeCount = c.likeCount ?? 0;
  const dislikeCount = c.dislikeCount ?? 0;
  const prevMy = c.myReaction ?? null;

  if (prevMy === value) {
    return {
      likeCount: value === "up" ? Math.max(0, likeCount - 1) : likeCount,
      dislikeCount: value === "down" ? Math.max(0, dislikeCount - 1) : dislikeCount,
      myReaction: null,
    };
  }
  let up = likeCount;
  let down = dislikeCount;
  if (prevMy === "up") up = Math.max(0, up - 1);
  else if (prevMy === "down") down = Math.max(0, down - 1);
  if (value === "up") up += 1;
  else down += 1;
  return { likeCount: up, dislikeCount: down, myReaction: value };
}

function updateCommentById(
  comments: IdeaComment[],
  commentId: string,
  updater: (c: IdeaComment) => IdeaComment,
): IdeaComment[] {
  return comments.map((c) => {
    if (c.id === commentId) return updater(c);
    if (c.replies?.length) {
      return { ...c, replies: updateCommentById(c.replies, commentId, updater) };
    }
    return c;
  });
}

/** Toggle like on a comment. STAFF only. Optimistic update for realtime feel. */
export function useLikeCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ideaId,
      commentId,
      value,
    }: { ideaId: string; commentId: string; value: "up" | "down" }): Promise<IdeaComment> => {
      const res = await fetchWithAuth<IdeaComment>(
        `ideas/${ideaId}/comments/${commentId}/like`,
        { method: "POST", body: JSON.stringify({ value }) },
      );
      return res;
    },
    onMutate: async ({ ideaId, commentId, value }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.ideas.comments(ideaId) });
      const prev = queryClient.getQueryData<IdeaComment[]>(queryKeys.ideas.comments(ideaId));
      queryClient.setQueryData<IdeaComment[]>(queryKeys.ideas.comments(ideaId), (old) => {
        if (!old) return old;
        return updateCommentById(old, commentId, (c) => {
          const applied = applyLikeComment(c, value);
          return { ...c, ...applied };
        });
      });
      return { prev };
    },
    onError: (_err, { ideaId }, ctx) => {
      if (ctx?.prev != null) {
        queryClient.setQueryData(queryKeys.ideas.comments(ideaId), ctx.prev);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.comments(ideaId) });
    },
    onSettled: (_data, _err, { ideaId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.comments(ideaId) });
    },
  });
}

/* ── Latest comments (cross‑idea) ────────────────────────────────────────── */

function parseLatestComments(data: unknown): LatestCommentsResponse {
  const parsed = latestCommentsResponseSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid latest comments response");
  return parsed.data;
}

/** Latest comments across all ideas in the active academic year. */
export function useLatestCommentsQuery(options?: { enabled?: boolean; limit?: number }) {
  const limit = options?.limit ?? 10;
  return useQuery({
    queryKey: queryKeys.ideas.latestComments(limit),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>(
        `ideas/latest-comments?limit=${limit}`,
      );
      return parseLatestComments(data);
    },
    enabled: options?.enabled !== false,
  });
}

/* ── View tracking ───────────────────────────────────────────────────────── */

/** Increment viewCount by 1 in cache for real-time UI update when dwell completes. */
function incrementViewInCache(ideaId: string, queryClient: ReturnType<typeof useQueryClient>) {
  const inc = (v: number | undefined) => (v ?? 0) + 1;

  // Idea detail
  queryClient.setQueryData<Idea>(queryKeys.ideas.detail(ideaId), (old) =>
    old ? { ...old, viewCount: inc(old.viewCount) } : old
  );

  // Ideas list + My ideas list
  queryClient.setQueriesData<{ items?: Array<{ id: string; viewCount?: number }> }>(
    { queryKey: queryKeys.ideas.all },
    (old) => {
      if (!old || !("items" in old)) return old;
      const items = (old as { items: Array<{ id: string; viewCount?: number }> }).items;
      return {
        ...old,
        items: items.map((i) =>
          i.id === ideaId ? { ...i, viewCount: inc(i.viewCount) } : i
        ),
      };
    }
  );
}

/**
 * Record a view. Idempotent on backend.
 * Optimistic cache update so view count increases in real time when dwell completes.
 */
export function useRecordViewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ideaId: string) => {
      await fetchWithAuth<void>(`ideas/${ideaId}/view`, { method: "POST" });
    },
    onSuccess: (_, ideaId) => {
      incrementViewInCache(ideaId, queryClient);
    },
    onError: () => {},
  });
}

/* ── Own‑idea management hooks (STAFF only) ──────────────────────────────── */

function parseOwnIdeasPaginated(data: unknown): OwnIdeasPaginatedResponse {
  const parsed = ownIdeasPaginatedResponseSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid own ideas list response");
  return parsed.data;
}

function parseOwnIdea(data: unknown): OwnIdea {
  const parsed = ownIdeaSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid own idea response");
  return parsed.data;
}

/** Filter options for My Ideas: years, cycles, categories (only those user has submitted in). STAFF only. */
export function useMyIdeasFiltersQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.ideas.my.filters(),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>("ideas/my/filters");
      const parsed = myIdeasFiltersSchema.safeParse(data);
      if (!parsed.success) throw new Error("Invalid my ideas filters response");
      return parsed.data;
    },
    enabled: options?.enabled !== false,
  });
}

/** Nearest deadline among items for real-time refetch when submission closes. */
function getMyIdeasRefetchInterval(data: { items?: Array<{ submissionClosesAt?: string | Date | null }> } | undefined): number | false {
  const items = data?.items ?? [];
  let nearest: number | null = null;
  for (const item of items) {
    const interval = getDeadlineRefetchInterval(item.submissionClosesAt);
    if (interval && (nearest === null || interval < nearest)) nearest = interval;
  }
  return nearest ?? false;
}

/** List the current user's own ideas with pagination. STAFF only. */
export function useMyIdeasQuery(
  params?: { page?: number; limit?: number; categoryId?: string; cycleId?: string; academicYearId?: string },
  options?: { enabled?: boolean },
) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 5;
  const categoryId = params?.categoryId;
  const cycleId = params?.cycleId;
  const academicYearId = params?.academicYearId;
  return useQuery({
    queryKey: queryKeys.ideas.my.list({ page, limit, categoryId, cycleId, academicYearId }),
    queryFn: async () => {
      const search = new URLSearchParams();
      search.set("page", String(page));
      search.set("limit", String(limit));
      if (categoryId) search.set("categoryId", categoryId);
      if (cycleId) search.set("cycleId", cycleId);
      if (academicYearId) search.set("academicYearId", academicYearId);
      const data = await fetchWithAuth<unknown>(`ideas/my?${search.toString()}`);
      return parseOwnIdeasPaginated(data);
    },
    enabled: options?.enabled !== false,
    refetchInterval: (query) => getMyIdeasRefetchInterval(query.state.data),
  });
}

/** Get a single own idea (full detail for editing). STAFF only, ownership verified. */
export function useMyIdeaQuery(id: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.ideas.my.detail(id ?? ""),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>(`ideas/my/${id}`);
      return parseOwnIdea(data);
    },
    enabled: options?.enabled !== false && !!id,
    refetchInterval: (query) => getDeadlineRefetchInterval((query.state.data as { submissionClosesAt?: string | Date | null })?.submissionClosesAt),
  });
}

/** Update own idea text fields. STAFF only. */
export function useUpdateMyIdeaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateIdeaBody }) => {
      const res = await fetchWithAuth<unknown>(`ideas/my/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      return parseOwnIdea(res);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.my.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.my.filters() });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
      queryClient.setQueryData(queryKeys.ideas.my.detail(data.id), data);
    },
  });
}

/** Delete own idea. ALWAYS allowed. STAFF only. */
export function useDeleteMyIdeaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await fetchWithAuth<void>(`ideas/my/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.my.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.my.filters() });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
    },
  });
}

/** Add attachment to own idea. STAFF only. */
export function useAddAttachmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ideaId,
      body,
    }: {
      ideaId: string;
      body: IdeaAttachmentRef;
    }) => {
      const res = await fetchWithAuth<unknown>(`ideas/my/${ideaId}/attachments`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      return parseOwnIdea(res);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.ideas.my.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.my.list() });
    },
  });
}

/** Remove attachment from own idea. STAFF only. */
export function useRemoveAttachmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ideaId,
      attachmentId,
    }: {
      ideaId: string;
      attachmentId: string;
    }) => {
      const res = await fetchWithAuth<unknown>(
        `ideas/my/${ideaId}/attachments/${attachmentId}`,
        { method: "DELETE" },
      );
      return parseOwnIdea(res);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.ideas.my.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.my.list() });
    },
  });
}
