-- Migration: Modernize Protocol Tracking with JSONB
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
CREATE INDEX idx_protocol_change_events_type ON protocol_change_events USING GIN ((event_data->>'change_type'));

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
-- 4. ADD JSONB DOCUMENTATION
-- =====================================================

COMMENT ON TABLE protocol_change_events IS 'Tracks all protocol changes with rich context for effectiveness analysis';
COMMENT ON COLUMN protocol_change_events.event_data IS 'JSONB structure containing change details, context, and metadata';

COMMENT ON COLUMN user_protocols.protocol_data IS 'JSONB structure containing flexible protocol tracking data';

-- =====================================================
-- 5. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get current active protocol for a user
CREATE OR REPLACE FUNCTION get_user_current_protocol(p_user_id UUID)
RETURNS TABLE(protocol_id UUID, protocol_name VARCHAR, phase INTEGER, compliance_score NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.protocol_id,
        p.name,
        (up.protocol_data->>'current_phase')::INTEGER,
        (up.protocol_data->>'compliance_score')::NUMERIC
    FROM user_protocols up
    JOIN protocols p ON up.protocol_id = p.id
    WHERE up.user_id = p_user_id 
      AND (up.protocol_data->>'active')::BOOLEAN = true
      AND up.active = true
    ORDER BY up.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to log protocol changes
CREATE OR REPLACE FUNCTION log_protocol_change(
    p_user_id UUID,
    p_previous_protocol_id UUID DEFAULT NULL,
    p_new_protocol_id UUID DEFAULT NULL,
    p_change_reason TEXT DEFAULT NULL,
    p_context JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    event_id UUID;
    prev_protocol_name VARCHAR;
    new_protocol_name VARCHAR;
BEGIN
    -- Get protocol names
    IF p_previous_protocol_id IS NOT NULL THEN
        SELECT name INTO prev_protocol_name FROM protocols WHERE id = p_previous_protocol_id;
    END IF;
    
    IF p_new_protocol_id IS NOT NULL THEN
        SELECT name INTO new_protocol_name FROM protocols WHERE id = p_new_protocol_id;
    END IF;
    
    -- Insert protocol change event
    INSERT INTO protocol_change_events (user_id, event_data)
    VALUES (
        p_user_id,
        jsonb_build_object(
            'change_type', 'protocol_switch',
            'previous_protocol', CASE 
                WHEN p_previous_protocol_id IS NOT NULL THEN
                    jsonb_build_object(
                        'id', p_previous_protocol_id::text,
                        'name', prev_protocol_name
                    )
                ELSE NULL
            END,
            'new_protocol', CASE 
                WHEN p_new_protocol_id IS NOT NULL THEN
                    jsonb_build_object(
                        'id', p_new_protocol_id::text,
                        'name', new_protocol_name
                    )
                ELSE NULL
            END,
            'context', p_context || jsonb_build_object(
                'change_reason', p_change_reason,
                'changed_at', now()::text
            )
        )
    )
    RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- =====================================================
-- SAMPLE JSONB STRUCTURES FOR DOCUMENTATION
-- =====================================================

/*
protocol_change_events.event_data examples:

1. Protocol Switch:
{
  "change_type": "protocol_switch",
  "previous_protocol": {
    "id": "uuid",
    "name": "AIP",
    "duration_days": 45,
    "compliance_score": 0.85
  },
  "new_protocol": {
    "id": "uuid",
    "name": "FODMAP"
  },
  "context": {
    "change_reason": "symptom_plateau",
    "changed_by": "user",
    "symptom_summary": {
      "avg_severity_last_30_days": 3.2,
      "primary_symptoms": ["bloating", "fatigue"]
    }
  },
  "metadata": {
    "source": "preferences_page",
    "user_notes": "Need more variety in diet"
  }
}

2. Phase Advancement:
{
  "change_type": "phase_advance",
  "protocol": {
    "id": "uuid",
    "name": "AIP"
  },
  "phase_change": {
    "from": 1,
    "to": 2,
    "advancement_reason": "completed_elimination_period"
  },
  "context": {
    "compliance_score": 0.92,
    "symptom_improvement": true
  }
}

user_protocols.protocol_data examples:

{
  "current_phase": 2,
  "compliance_score": 0.85,
  "active": true,
  "phase_history": [
    {
      "phase": 1,
      "started": "2025-01-15",
      "completed": "2025-02-15",
      "compliance": 0.9,
      "notes": "Elimination phase completed successfully"
    }
  ],
  "custom_modifications": {
    "allowed_foods": ["sweet_potato", "white_rice"],
    "practitioner_notes": "Patient tolerating modifications well"
  },
  "tracking_metrics": {
    "weekly_compliance": [0.9, 0.85, 0.88, 0.92],
    "symptom_trends": {
      "bloating": "improving",
      "energy": "stable"
    }
  }
}
*/
