-- Migration: Remove duplicate FK constraints (old ones without CASCADE)
-- The previous migration added new constraints but the old _fkey ones remain

-- timeline_entries.food_id — drop old, keep new (SET NULL)
ALTER TABLE timeline_entries DROP CONSTRAINT IF EXISTS timeline_entries_food_id_fkey;

-- timeline_entries.source_message_id — drop old, keep new (SET NULL)
ALTER TABLE timeline_entries DROP CONSTRAINT IF EXISTS timeline_entries_source_message_id_fkey;

-- reintroduction_log.food_id — drop old, keep new (SET NULL)
ALTER TABLE reintroduction_log DROP CONSTRAINT IF EXISTS reintroduction_log_food_id_fkey;

-- profiles.current_protocol_id — drop old, keep new (SET NULL)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_current_protocol_id_fkey;
