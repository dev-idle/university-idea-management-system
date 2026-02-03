-- CreateTable
CREATE TABLE "IdeaSubmissionCycle" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "academicYearId" UUID NOT NULL,
    "name" VARCHAR(255),
    "ideaSubmissionClosesAt" TIMESTAMP(3) NOT NULL,
    "commentClosesAt" TIMESTAMP(3) NOT NULL,
    "voteClosesAt" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdeaSubmissionCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CycleCategory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cycleId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CycleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdeaSubmissionCycle_academicYearId_idx" ON "IdeaSubmissionCycle"("academicYearId");

-- CreateIndex
CREATE INDEX "IdeaSubmissionCycle_status_idx" ON "IdeaSubmissionCycle"("status");

-- CreateIndex
CREATE INDEX "CycleCategory_cycleId_idx" ON "CycleCategory"("cycleId");

-- CreateIndex
CREATE INDEX "CycleCategory_categoryId_idx" ON "CycleCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CycleCategory_cycleId_categoryId_key" ON "CycleCategory"("cycleId", "categoryId");

-- AddForeignKey
ALTER TABLE "IdeaSubmissionCycle" ADD CONSTRAINT "IdeaSubmissionCycle_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CycleCategory" ADD CONSTRAINT "CycleCategory_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "IdeaSubmissionCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CycleCategory" ADD CONSTRAINT "CycleCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
