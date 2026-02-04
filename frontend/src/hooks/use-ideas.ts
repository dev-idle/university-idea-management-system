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
} from "@/lib/schemas/ideas.schema";
import {
  ideaSchema,
  ideasPaginatedResponseSchema,
  ideasContextSchema,
  ideaCommentsResponseSchema,
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
  sort?: "latest" | "mostPopular" | "mostViewed";
};

/** List ideas for the active academic year with pagination and sort. STAFF only. */
export function useIdeasQuery(params?: IdeasListParams, options?: { enabled?: boolean }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 5;
  const sort = params?.sort ?? "latest";
  return useQuery({
    queryKey: queryKeys.ideas.list({ page, limit, sort }),
    queryFn: async () => {
      const search = new URLSearchParams();
      search.set("page", String(page));
      search.set("limit", String(limit));
      if (sort !== "latest") search.set("sort", sort);
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

/** Vote on an idea (up or down). One vote per user. STAFF only. */
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.detail(data.id) });
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
