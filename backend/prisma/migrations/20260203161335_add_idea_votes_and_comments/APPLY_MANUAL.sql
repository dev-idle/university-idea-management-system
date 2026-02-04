-- Run this in your PostgreSQL client (Neon SQL Editor, psql, etc.)
-- if "prisma migrate deploy" times out. Creates IdeaVote and IdeaComment.

-- CreateTable
CREATE TABLE IF NOT EXISTS "IdeaVote" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ideaId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "value" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdeaVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "IdeaComment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ideaId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdeaComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IdeaVote_ideaId_idx" ON "IdeaVote"("ideaId");
CREATE INDEX IF NOT EXISTS "IdeaVote_userId_idx" ON "IdeaVote"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "IdeaVote_ideaId_userId_key" ON "IdeaVote"("ideaId", "userId");

CREATE INDEX IF NOT EXISTS "IdeaComment_ideaId_idx" ON "IdeaComment"("ideaId");
CREATE INDEX IF NOT EXISTS "IdeaComment_userId_idx" ON "IdeaComment"("userId");

-- AddForeignKey (run once; omit if tables were created by migrate deploy)
ALTER TABLE "IdeaVote" ADD CONSTRAINT "IdeaVote_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IdeaVote" ADD CONSTRAINT "IdeaVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IdeaComment" ADD CONSTRAINT "IdeaComment_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IdeaComment" ADD CONSTRAINT "IdeaComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- After running this, mark the migration as applied so Prisma doesn't re-run it:
--   npx prisma migrate resolve --applied 20260203161335_add_idea_votes_and_comments
