/*
  Warnings:

  - Added the required column `value` to the `IdeaCommentLike` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IdeaCommentLike" ADD COLUMN     "value" VARCHAR(10) NOT NULL;
