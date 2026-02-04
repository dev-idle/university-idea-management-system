-- AlterTable Idea: add submission fields and optional description
ALTER TABLE "Idea" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Idea" ADD COLUMN IF NOT EXISTS "cycleId" UUID;
ALTER TABLE "Idea" ADD COLUMN IF NOT EXISTS "submittedById" UUID;
ALTER TABLE "Idea" ADD COLUMN IF NOT EXISTS "isAnonymous" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Idea" ADD COLUMN IF NOT EXISTS "termsAcceptedAt" TIMESTAMP(3);

-- CreateTable IdeaAttachment
CREATE TABLE "IdeaAttachment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ideaId" UUID NOT NULL,
    "cloudinaryPublicId" VARCHAR(255) NOT NULL,
    "secureUrl" VARCHAR(1024) NOT NULL,
    "fileName" VARCHAR(512) NOT NULL,
    "mimeType" VARCHAR(128),
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdeaAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Idea_cycleId_idx" ON "Idea"("cycleId");
CREATE INDEX "Idea_submittedById_idx" ON "Idea"("submittedById");
CREATE INDEX "IdeaAttachment_ideaId_idx" ON "IdeaAttachment"("ideaId");

-- AddForeignKey Idea -> IdeaSubmissionCycle
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "IdeaSubmissionCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey Idea -> User
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey IdeaAttachment -> Idea
ALTER TABLE "IdeaAttachment" ADD CONSTRAINT "IdeaAttachment_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
