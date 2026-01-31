-- Add indexes for 2026 performance and security (paginated lists, lookups, token cleanup).

CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

CREATE INDEX "Department_name_idx" ON "Department"("name");

CREATE INDEX "AcademicYear_startDate_idx" ON "AcademicYear"("startDate");
CREATE INDEX "AcademicYear_isActive_idx" ON "AcademicYear"("isActive");

CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");
