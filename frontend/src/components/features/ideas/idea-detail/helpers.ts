import type { IdeaComment } from "@/lib/schemas/ideas.schema";

export function countAllComments(comments: IdeaComment[]): number {
  return comments.reduce(
    (acc, c) => acc + 1 + countAllComments(c.replies ?? []),
    0,
  );
}

export function findCommentById(comments: IdeaComment[], id: string): IdeaComment | undefined {
  for (const c of comments) {
    if (c.id === id) return c;
    const found = findCommentById(c.replies ?? [], id);
    if (found) return found;
  }
  return undefined;
}

/** True if targetId exists in comment's reply subtree (not the comment itself). */
export function commentRepliesContainId(comment: IdeaComment, targetId: string): boolean {
  for (const r of comment.replies ?? []) {
    if (r.id === targetId || commentRepliesContainId(r, targetId)) return true;
  }
  return false;
}
