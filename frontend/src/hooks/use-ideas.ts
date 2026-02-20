"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type {
  Idea,
  IdeasContext,
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

/** Context for Ideas Hub: can submit, active cycle, categories, active academic year. STAFF only. */
export function useIdeasContextQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.ideas.context(),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>("ideas/context");
      return parseIdeasContext(data);
    },
    enabled: options?.enabled !== false,
  });
}

export type IdeasListParams = {
  page?: number;
  limit?: number;
  sort?: "latest" | "mostPopular" | "mostViewed" | "latestComments";
  categoryId?: string;
  cycleId?: string;
};

/** List ideas for the active academic year with pagination and sort. STAFF only. */
export function useIdeasQuery(params?: IdeasListParams, options?: { enabled?: boolean }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 5;
  const sort = params?.sort ?? "latest";
  const categoryId = params?.categoryId;
  const cycleId = params?.cycleId;
  return useQuery({
    queryKey: queryKeys.ideas.list({ page, limit, sort, categoryId, cycleId }),
    queryFn: async () => {
      const search = new URLSearchParams();
      search.set("page", String(page));
      search.set("limit", String(limit));
      if (sort !== "latest") search.set("sort", sort);
      if (categoryId) search.set("categoryId", categoryId);
      if (cycleId) search.set("cycleId", cycleId);
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

/**
 * Fire-and-forget mutation to record a view. Idempotent on backend.
 * No query invalidation – view counts update on next natural refetch.
 */
export function useRecordViewMutation() {
  return useMutation({
    mutationFn: async (ideaId: string) => {
      await fetchWithAuth<void>(`ideas/${ideaId}/view`, { method: "POST" });
    },
    // Silent: no invalidation, no error surfacing
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

/** List the current user's own ideas with pagination. STAFF only. */
export function useMyIdeasQuery(
  params?: { page?: number; limit?: number },
  options?: { enabled?: boolean },
) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 5;
  return useQuery({
    queryKey: queryKeys.ideas.my.list({ page, limit }),
    queryFn: async () => {
      const search = new URLSearchParams();
      search.set("page", String(page));
      search.set("limit", String(limit));
      const data = await fetchWithAuth<unknown>(`ideas/my?${search.toString()}`);
      return parseOwnIdeasPaginated(data);
    },
    enabled: options?.enabled !== false,
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
