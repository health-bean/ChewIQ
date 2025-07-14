-- Migration: Modernize Protocol Tracking with JSONB (Simplified)
-- Date: 2025-07-14
-- Purpose: Add protocol change tracking and modernize user_protocols table

BEGIN;

-- =====================================================
-- 1. CREATE PROTOCOL CHANGE EVENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS protocol_change_events (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    event_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (id)
);

-- Add constraints and indexes
ALTER TABLE protocol_change_events ADD CONSTRAINT protocol_change_events_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX idx_protocol_change_events_user ON protocol_change_events(user_id);
CREATE INDEX idx_protocol_change_events_date ON protocol_change_events(created_at);
-- Simple btree index for change_type lookups
CREATE INDEX idx_protocol_change_events_type ON protocol_change_events((event_data->>'change_type'));

-- =====================================================
-- 2. MODERNIZE USER_PROTOCOLS TABLE
-- =====================================================

-- Add JSONB column for flexible protocol data
ALTER TABLE user_protocols ADD COLUMN IF NOT EXISTS protocol_data JSONB DEFAULT '{}';

-- Migrate existing data to JSONB structure
UPDATE user_protocols 
SET protocol_data = jsonb_build_object(
    'current_phase', COALESCE(current_phase, 1),
    'compliance_score', compliance_score,
    'active', COALESCE(active, true),
    'legacy_migrated', true,
    'migration_date', now()::text,
    'phase_history', jsonb_build_array(
        jsonb_build_object(
            'phase', COALESCE(current_phase, 1),
            'started', start_date::text,
            'status', CASE 
                WHEN end_date IS NOT NULL THEN 'completed'
                WHEN active = true THEN 'active'
                ELSE 'inactive'
            END
        )
    )
)
WHERE protocol_data = '{}' OR protocol_data IS NULL;

-- =====================================================
-- 3. CREATE INITIAL PROTOCOL CHANGE EVENTS
-- =====================================================

-- Create initial protocol assignment events for existing user_protocols
INSERT INTO protocol_change_events (user_id, event_data)
SELECT 
    up.user_id,
    jsonb_build_object(
        'change_type', 'initial_assignment',
        'new_protocol', jsonb_build_object(
            'id', up.protocol_id::text,
            'name', p.name,
            'assigned_date', up.start_date::text
        ),
        'context', jsonb_build_object(
            'source', 'migration',
            'migration_note', 'Initial protocol assignment from existing data'
        ),
        'metadata', jsonb_build_object(
            'migrated_from_user_protocols', true,
            'original_record_id', up.id::text
        )
    )
FROM user_protocols up
JOIN protocols p ON up.protocol_id = p.id
WHERE up.start_date IS NOT NULL;

-- =====================================================
-- 4. ADD DOCUMENTATION
-- =====================================================

COMMENT ON TABLE protocol_change_events IS 'Tracks all protocol changes with rich context for effectiveness analysis';
COMMENT ON COLUMN protocol_change_events.event_data IS 'JSONB structure containing change details, context, and metadata';
COMMENT ON COLUMN user_protocols.protocol_data IS 'JSONB structure containing flexible protocol tracking data';

COMMIT;
