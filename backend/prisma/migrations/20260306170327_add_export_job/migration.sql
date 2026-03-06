-- CreateTable
CREATE TABLE "ExportJob" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "cycleId" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "cloudinaryUrl" VARCHAR(1024),
    "fileName" VARCHAR(512),
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExportJob_userId_idx" ON "ExportJob"("userId");

-- CreateIndex
CREATE INDEX "ExportJob_cycleId_idx" ON "ExportJob"("cycleId");

-- CreateIndex
CREATE INDEX "ExportJob_status_idx" ON "ExportJob"("status");

-- CreateIndex
CREATE INDEX "ExportJob_status_createdAt_idx" ON "ExportJob"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "ExportJob" ADD CONSTRAINT "ExportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportJob" ADD CONSTRAINT "ExportJob_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "IdeaSubmissionCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
