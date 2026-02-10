-- DropIndex
DROP INDEX "IdeaView_ideaId_userId_key";

-- CreateIndex
CREATE INDEX "IdeaView_ideaId_userId_createdAt_idx" ON "IdeaView"("ideaId", "userId", "createdAt");
