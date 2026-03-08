-- Clear all data (keep schema). Run: npx prisma db execute --file prisma/clear-data.sql
TRUNCATE TABLE idea_comment_reactions, idea_comments, idea_votes, idea_views, idea_attachments, ideas, cycle_categories, export_jobs, idea_submission_cycles, notifications, refresh_tokens, users, roles, departments, academic_years, categories RESTART IDENTITY CASCADE;
