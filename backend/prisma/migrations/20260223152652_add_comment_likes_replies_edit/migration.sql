/*
  Warnings:

  - Added the required column `updatedAt` to the `IdeaComment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IdeaComment" ADD COLUMN     "parentCommentId" UUID,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "IdeaCommentLike" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "commentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdeaCommentLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdeaCommentLike_commentId_idx" ON "IdeaCommentLike"("commentId");

-- CreateIndex
CREATE INDEX "IdeaCommentLike_userId_idx" ON "IdeaCommentLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "IdeaCommentLike_commentId_userId_key" ON "IdeaCommentLike"("commentId", "userId");

-- CreateIndex
CREATE INDEX "IdeaComment_parentCommentId_idx" ON "IdeaComment"("parentCommentId");

-- AddForeignKey
ALTER TABLE "IdeaComment" ADD CONSTRAINT "IdeaComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "IdeaComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeaCommentLike" ADD CONSTRAINT "IdeaCommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "IdeaComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeaCommentLike" ADD CONSTRAINT "IdeaCommentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
