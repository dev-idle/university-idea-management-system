-- Backfill wasEverClosed for cycles that are CLOSED (they were closed, so wasEverClosed should be true).
-- Fixes cycles that had wasEverClosed reset to false when the column was dropped and re-added in earlier migrations.
UPDATE "IdeaSubmissionCycle"
SET "wasEverClosed" = true
WHERE status = 'CLOSED' AND "wasEverClosed" = false;