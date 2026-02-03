-- AlterTable: add optional profile fields to User (phone unique)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" VARCHAR(30);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gender" VARCHAR(50);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dateOfBirth" DATE;

-- CreateIndex: phone must be unique
CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone");
