"use server";

import { refreshAction } from "@/actions/auth.actions";
import { apiClient } from "@/lib/api/client";
import { ideaSchema, ideaCommentsResponseSchema } from "@/lib/schemas/ideas.schema";
import type { Idea } from "@/lib/schemas/ideas.schema";
import type { IdeaComment } from "@/lib/schemas/ideas.schema";

function parseIdea(data: unknown): Idea {
  const parsed = ideaSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid idea response");
  return parsed.data;
}

function parseComments(data: unknown): IdeaComment[] {
  const parsed = ideaCommentsResponseSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid comments response");
  return parsed.data;
}

export type IdeaDetailPageData =
  | { idea: Idea; comments: IdeaComment[] }
  | { error: "not_found" }
  | null;

/**
 * Server-side fetch of idea and comments using refresh token.
 * Use in Server Components for initial data to avoid client loading state.
 * - Returns null if not authenticated (caller should redirect to login).
 * - Returns { error: "not_found" } if idea does not exist (caller should notFound()).
 * - Returns { idea, comments } on success.
 */
export async function getIdeaDetailForPage(
  ideaId: string
): Promise<IdeaDetailPageData> {
  const refreshResult = await refreshAction();
  if (!refreshResult.ok) return null;

  const { accessToken } = refreshResult.data;
  try {
    const [ideaRaw, commentsRaw] = await Promise.all([
      apiClient<unknown>(`ideas/${ideaId}`, { accessToken }),
      apiClient<unknown>(`ideas/${ideaId}/comments`, { accessToken }),
    ]);
    const idea = parseIdea(ideaRaw);
    const comments = parseComments(commentsRaw);
    return { idea, comments };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("404") || msg.includes("Idea not found") || msg.includes("not found")) {
      return { error: "not_found" };
    }
    return null;
  }
}
