/*
  Warnings:

  - You are about to drop the column `commentClosesAt` on the `IdeaSubmissionCycle` table. All the data in the column will be lost.
  - You are about to drop the column `voteClosesAt` on the `IdeaSubmissionCycle` table. All the data in the column will be lost.
  - Added the required column `interactionClosesAt` to the `IdeaSubmissionCycle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IdeaSubmissionCycle" DROP COLUMN "commentClosesAt",
DROP COLUMN "voteClosesAt",
ADD COLUMN     "interactionClosesAt" TIMESTAMP(3) NOT NULL;
