-- AlterTable
ALTER TABLE "academic_years" RENAME CONSTRAINT "AcademicYear_pkey" TO "academic_years_pkey";

-- AlterTable
ALTER TABLE "categories" RENAME CONSTRAINT "Category_pkey" TO "categories_pkey";

-- AlterTable
ALTER TABLE "cycle_categories" RENAME CONSTRAINT "CycleCategory_pkey" TO "cycle_categories_pkey";

-- AlterTable
ALTER TABLE "departments" RENAME CONSTRAINT "Department_pkey" TO "departments_pkey";

-- AlterTable
ALTER TABLE "export_jobs" RENAME CONSTRAINT "ExportJob_pkey" TO "export_jobs_pkey";

-- AlterTable
ALTER TABLE "idea_attachments" RENAME CONSTRAINT "IdeaAttachment_pkey" TO "idea_attachments_pkey";

-- AlterTable
ALTER TABLE "idea_comment_reactions" RENAME CONSTRAINT "IdeaCommentLike_pkey" TO "idea_comment_reactions_pkey";

-- AlterTable
ALTER TABLE "idea_comments" RENAME CONSTRAINT "IdeaComment_pkey" TO "idea_comments_pkey";

-- AlterTable
ALTER TABLE "idea_submission_cycles" RENAME CONSTRAINT "IdeaSubmissionCycle_pkey" TO "idea_submission_cycles_pkey";

-- AlterTable
ALTER TABLE "idea_views" RENAME CONSTRAINT "IdeaView_pkey" TO "idea_views_pkey";

-- AlterTable
ALTER TABLE "idea_votes" RENAME CONSTRAINT "IdeaVote_pkey" TO "idea_votes_pkey";

-- AlterTable
ALTER TABLE "ideas" RENAME CONSTRAINT "Idea_pkey" TO "ideas_pkey";

-- AlterTable
ALTER TABLE "notifications" RENAME CONSTRAINT "Notification_pkey" TO "notifications_pkey";

-- AlterTable
ALTER TABLE "refresh_tokens" RENAME CONSTRAINT "RefreshToken_pkey" TO "refresh_tokens_pkey";

-- AlterTable
ALTER TABLE "roles" RENAME CONSTRAINT "Role_pkey" TO "roles_pkey";

-- AlterTable
ALTER TABLE "users" RENAME CONSTRAINT "User_pkey" TO "users_pkey";

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "password_reset_tokens_tokenHash_idx" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expiresAt_idx" ON "password_reset_tokens"("expiresAt");

-- RenameForeignKey
ALTER TABLE "cycle_categories" RENAME CONSTRAINT "CycleCategory_categoryId_fkey" TO "cycle_categories_categoryId_fkey";

-- RenameForeignKey
ALTER TABLE "cycle_categories" RENAME CONSTRAINT "CycleCategory_cycleId_fkey" TO "cycle_categories_cycleId_fkey";

-- RenameForeignKey
ALTER TABLE "export_jobs" RENAME CONSTRAINT "ExportJob_cycleId_fkey" TO "export_jobs_cycleId_fkey";

-- RenameForeignKey
ALTER TABLE "export_jobs" RENAME CONSTRAINT "ExportJob_userId_fkey" TO "export_jobs_userId_fkey";

-- RenameForeignKey
ALTER TABLE "idea_attachments" RENAME CONSTRAINT "IdeaAttachment_ideaId_fkey" TO "idea_attachments_ideaId_fkey";

-- RenameForeignKey
ALTER TABLE "idea_comment_reactions" RENAME CONSTRAINT "IdeaCommentLike_commentId_fkey" TO "idea_comment_reactions_commentId_fkey";

-- RenameForeignKey
ALTER TABLE "idea_comment_reactions" RENAME CONSTRAINT "IdeaCommentLike_userId_fkey" TO "idea_comment_reactions_userId_fkey";

-- RenameForeignKey
ALTER TABLE "idea_comments" RENAME CONSTRAINT "IdeaComment_ideaId_fkey" TO "idea_comments_ideaId_fkey";

-- RenameForeignKey
ALTER TABLE "idea_comments" RENAME CONSTRAINT "IdeaComment_parentCommentId_fkey" TO "idea_comments_parentCommentId_fkey";

-- RenameForeignKey
ALTER TABLE "idea_comments" RENAME CONSTRAINT "IdeaComment_userId_fkey" TO "idea_comments_userId_fkey";

-- RenameForeignKey
ALTER TABLE "idea_submission_cycles" RENAME CONSTRAINT "IdeaSubmissionCycle_academicYearId_fkey" TO "idea_submission_cycles_academicYearId_fkey";

-- RenameForeignKey
ALTER TABLE "idea_views" RENAME CONSTRAINT "IdeaView_ideaId_fkey" TO "idea_views_ideaId_fkey";

-- RenameForeignKey
ALTER TABLE "idea_views" RENAME CONSTRAINT "IdeaView_userId_fkey" TO "idea_views_userId_fkey";

-- RenameForeignKey
ALTER TABLE "idea_votes" RENAME CONSTRAINT "IdeaVote_ideaId_fkey" TO "idea_votes_ideaId_fkey";

-- RenameForeignKey
ALTER TABLE "idea_votes" RENAME CONSTRAINT "IdeaVote_userId_fkey" TO "idea_votes_userId_fkey";

-- RenameForeignKey
ALTER TABLE "ideas" RENAME CONSTRAINT "Idea_categoryId_fkey" TO "ideas_categoryId_fkey";

-- RenameForeignKey
ALTER TABLE "ideas" RENAME CONSTRAINT "Idea_cycleId_fkey" TO "ideas_cycleId_fkey";

-- RenameForeignKey
ALTER TABLE "ideas" RENAME CONSTRAINT "Idea_submittedById_fkey" TO "ideas_submittedById_fkey";

-- RenameForeignKey
ALTER TABLE "notifications" RENAME CONSTRAINT "Notification_userId_fkey" TO "notifications_userId_fkey";

-- RenameForeignKey
ALTER TABLE "refresh_tokens" RENAME CONSTRAINT "RefreshToken_userId_fkey" TO "refresh_tokens_userId_fkey";

-- RenameForeignKey
ALTER TABLE "users" RENAME CONSTRAINT "User_departmentId_fkey" TO "users_departmentId_fkey";

-- RenameForeignKey
ALTER TABLE "users" RENAME CONSTRAINT "User_roleId_fkey" TO "users_roleId_fkey";

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "AcademicYear_isActive_idx" RENAME TO "academic_years_isActive_idx";

-- RenameIndex
ALTER INDEX "AcademicYear_startDate_idx" RENAME TO "academic_years_startDate_idx";

-- RenameIndex
ALTER INDEX "Category_name_idx" RENAME TO "categories_name_idx";

-- RenameIndex
ALTER INDEX "Category_name_key" RENAME TO "categories_name_key";

-- RenameIndex
ALTER INDEX "CycleCategory_categoryId_idx" RENAME TO "cycle_categories_categoryId_idx";

-- RenameIndex
ALTER INDEX "CycleCategory_cycleId_categoryId_key" RENAME TO "cycle_categories_cycleId_categoryId_key";

-- RenameIndex
ALTER INDEX "CycleCategory_cycleId_idx" RENAME TO "cycle_categories_cycleId_idx";

-- RenameIndex
ALTER INDEX "Department_name_idx" RENAME TO "departments_name_idx";

-- RenameIndex
ALTER INDEX "ExportJob_cycleId_idx" RENAME TO "export_jobs_cycleId_idx";

-- RenameIndex
ALTER INDEX "ExportJob_status_createdAt_idx" RENAME TO "export_jobs_status_createdAt_idx";

-- RenameIndex
ALTER INDEX "ExportJob_status_idx" RENAME TO "export_jobs_status_idx";

-- RenameIndex
ALTER INDEX "ExportJob_userId_idx" RENAME TO "export_jobs_userId_idx";

-- RenameIndex
ALTER INDEX "IdeaAttachment_ideaId_idx" RENAME TO "idea_attachments_ideaId_idx";

-- RenameIndex
ALTER INDEX "IdeaCommentLike_commentId_idx" RENAME TO "idea_comment_reactions_commentId_idx";

-- RenameIndex
ALTER INDEX "IdeaCommentLike_commentId_userId_key" RENAME TO "idea_comment_reactions_commentId_userId_key";

-- RenameIndex
ALTER INDEX "IdeaCommentLike_userId_idx" RENAME TO "idea_comment_reactions_userId_idx";

-- RenameIndex
ALTER INDEX "IdeaComment_ideaId_idx" RENAME TO "idea_comments_ideaId_idx";

-- RenameIndex
ALTER INDEX "IdeaComment_parentCommentId_idx" RENAME TO "idea_comments_parentCommentId_idx";

-- RenameIndex
ALTER INDEX "IdeaComment_userId_idx" RENAME TO "idea_comments_userId_idx";

-- RenameIndex
ALTER INDEX "IdeaSubmissionCycle_academicYearId_idx" RENAME TO "idea_submission_cycles_academicYearId_idx";

-- RenameIndex
ALTER INDEX "IdeaSubmissionCycle_status_idx" RENAME TO "idea_submission_cycles_status_idx";

-- RenameIndex
ALTER INDEX "IdeaView_ideaId_idx" RENAME TO "idea_views_ideaId_idx";

-- RenameIndex
ALTER INDEX "IdeaView_ideaId_userId_createdAt_idx" RENAME TO "idea_views_ideaId_userId_createdAt_idx";

-- RenameIndex
ALTER INDEX "IdeaView_userId_idx" RENAME TO "idea_views_userId_idx";

-- RenameIndex
ALTER INDEX "IdeaVote_ideaId_idx" RENAME TO "idea_votes_ideaId_idx";

-- RenameIndex
ALTER INDEX "IdeaVote_ideaId_userId_key" RENAME TO "idea_votes_ideaId_userId_key";

-- RenameIndex
ALTER INDEX "IdeaVote_userId_idx" RENAME TO "idea_votes_userId_idx";

-- RenameIndex
ALTER INDEX "Idea_categoryId_idx" RENAME TO "ideas_categoryId_idx";

-- RenameIndex
ALTER INDEX "Idea_cycleId_idx" RENAME TO "ideas_cycleId_idx";

-- RenameIndex
ALTER INDEX "Idea_submittedById_idx" RENAME TO "ideas_submittedById_idx";

-- RenameIndex
ALTER INDEX "Notification_createdAt_idx" RENAME TO "notifications_createdAt_idx";

-- RenameIndex
ALTER INDEX "Notification_userId_idx" RENAME TO "notifications_userId_idx";

-- RenameIndex
ALTER INDEX "Notification_userId_isRead_idx" RENAME TO "notifications_userId_isRead_idx";

-- RenameIndex
ALTER INDEX "RefreshToken_expiresAt_idx" RENAME TO "refresh_tokens_expiresAt_idx";

-- RenameIndex
ALTER INDEX "RefreshToken_tokenId_key" RENAME TO "refresh_tokens_tokenId_key";

-- RenameIndex
ALTER INDEX "RefreshToken_userId_idx" RENAME TO "refresh_tokens_userId_idx";

-- RenameIndex
ALTER INDEX "Role_name_key" RENAME TO "roles_name_key";

-- RenameIndex
ALTER INDEX "User_createdAt_idx" RENAME TO "users_createdAt_idx";

-- RenameIndex
ALTER INDEX "User_departmentId_idx" RENAME TO "users_departmentId_idx";

-- RenameIndex
ALTER INDEX "User_email_key" RENAME TO "users_email_key";

-- RenameIndex
ALTER INDEX "User_phone_key" RENAME TO "users_phone_key";

-- RenameIndex
ALTER INDEX "User_roleId_idx" RENAME TO "users_roleId_idx";
