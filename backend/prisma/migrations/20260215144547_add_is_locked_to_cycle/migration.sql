/*
  Warnings:

  - You are about to drop the column `isUnlocked` on the `IdeaSubmissionCycle` table. All the data in the column will be lost.
  - You are about to drop the column `wasEverClosed` on the `IdeaSubmissionCycle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "IdeaSubmissionCycle" DROP COLUMN "isUnlocked",
DROP COLUMN "wasEverClosed",
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false;
