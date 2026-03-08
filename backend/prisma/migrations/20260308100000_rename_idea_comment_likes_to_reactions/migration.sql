-- Rename IdeaCommentLike to IdeaCommentReaction (stores both up/down, "Like" was misleading)
ALTER TABLE "idea_comment_likes" RENAME TO "idea_comment_reactions";
