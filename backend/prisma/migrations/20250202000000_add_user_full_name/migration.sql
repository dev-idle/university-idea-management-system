-- AlterTable: add optional fullName to User (profile display)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fullName" VARCHAR(255);
