-- Rename tables to snake_case (standard PostgreSQL convention)
-- Order: rename independent tables first, then dependent ones

ALTER TABLE "Role" RENAME TO "roles";
ALTER TABLE "Department" RENAME TO "departments";
ALTER TABLE "User" RENAME TO "users";
ALTER TABLE "AcademicYear" RENAME TO "academic_years";
ALTER TABLE "RefreshToken" RENAME TO "refresh_tokens";
ALTER TABLE "Category" RENAME TO "categories";
ALTER TABLE "IdeaSubmissionCycle" RENAME TO "idea_submission_cycles";
ALTER TABLE "CycleCategory" RENAME TO "cycle_categories";
ALTER TABLE "Idea" RENAME TO "ideas";
ALTER TABLE "IdeaVote" RENAME TO "idea_votes";
ALTER TABLE "IdeaComment" RENAME TO "idea_comments";
ALTER TABLE "IdeaCommentLike" RENAME TO "idea_comment_likes";
ALTER TABLE "IdeaAttachment" RENAME TO "idea_attachments";
ALTER TABLE "IdeaView" RENAME TO "idea_views";
ALTER TABLE "Notification" RENAME TO "notifications";
ALTER TABLE "ExportJob" RENAME TO "export_jobs";
