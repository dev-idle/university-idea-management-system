-- CreateTable
CREATE TABLE "IdeaView" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ideaId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdeaView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdeaView_ideaId_idx" ON "IdeaView"("ideaId");

-- CreateIndex
CREATE INDEX "IdeaView_userId_idx" ON "IdeaView"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "IdeaView_ideaId_userId_key" ON "IdeaView"("ideaId", "userId");

-- AddForeignKey
ALTER TABLE "IdeaView" ADD CONSTRAINT "IdeaView_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeaView" ADD CONSTRAINT "IdeaView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
