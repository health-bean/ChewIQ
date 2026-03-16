-- Add timezone support to profiles and timeline_entries
-- Run against production: psql $DATABASE_URL -f lib/db/migrations/add-timezone-columns.sql

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/New_York';

ALTER TABLE timeline_entries
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);
