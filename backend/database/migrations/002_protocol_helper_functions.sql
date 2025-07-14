-- Migration: Protocol Helper Functions
-- Date: 2025-07-14
-- Purpose: Add helper functions for protocol tracking and analysis

BEGIN;

-- =====================================================
-- HELPER FUNCTIONS FOR PROTOCOL TRACKING
-- =====================================================

-- Function to get current active protocol for a user
CREATE OR REPLACE FUNCTION get_user_current_protocol(p_user_id UUID)
RETURNS TABLE(protocol_id UUID, protocol_name VARCHAR, phase INTEGER, compliance_score NUMERIC, protocol_data JSONB) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.protocol_id,
        p.name,
        (up.protocol_data->>'current_phase')::INTEGER,
        (up.protocol_data->>'compliance_score')::NUMERIC,
        up.protocol_data
    FROM user_protocols up
    JOIN protocols p ON up.protocol_id = p.id
    WHERE up.user_id = p_user_id 
      AND (up.protocol_data->>'active')::BOOLEAN = true
      AND up.active = true
    ORDER BY up.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to log protocol changes with rich context
CREATE OR REPLACE FUNCTION log_protocol_change(
    p_user_id UUID,
    p_previous_protocol_id UUID DEFAULT NULL,
    p_new_protocol_id UUID DEFAULT NULL,
    p_change_reason TEXT DEFAULT NULL,
    p_context JSONB DEFAULT '{}',
    p_changed_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    event_id UUID;
    prev_protocol_name VARCHAR;
    new_protocol_name VARCHAR;
    prev_protocol_data JSONB;
BEGIN
    -- Get previous protocol details
    IF p_previous_protocol_id IS NOT NULL THEN
        SELECT p.name, up.protocol_data 
        INTO prev_protocol_name, prev_protocol_data
        FROM protocols p
        LEFT JOIN user_protocols up ON up.protocol_id = p.id AND up.user_id = p_user_id
        WHERE p.id = p_previous_protocol_id;
    END IF;
    
    -- Get new protocol name
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
                        'name', prev_protocol_name,
                        'duration_days', CASE 
                            WHEN prev_protocol_data IS NOT NULL THEN
                                EXTRACT(days FROM (now() - (prev_protocol_data->>'migration_date')::timestamp))
                            ELSE NULL
                        END,
                        'compliance_score', prev_protocol_data->>'compliance_score'
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
                'changed_at', now()::text,
                'changed_by', COALESCE(p_changed_by::text, 'system')
            ),
            'metadata', jsonb_build_object(
                'source', 'preferences_change',
                'timestamp', extract(epoch from now())
            )
        )
    )
    RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get protocol effectiveness insights
CREATE OR REPLACE FUNCTION get_protocol_effectiveness_insights(p_days_back INTEGER DEFAULT 90)
RETURNS TABLE(
    protocol_name VARCHAR,
    total_users BIGINT,
    avg_duration_days NUMERIC,
    switch_reasons JSONB,
    effectiveness_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (event_data->'previous_protocol'->>'name')::VARCHAR as protocol_name,
        COUNT(DISTINCT user_id) as total_users,
        AVG((event_data->'previous_protocol'->>'duration_days')::NUMERIC) as avg_duration_days,
        jsonb_agg(DISTINCT event_data->'context'->>'change_reason') FILTER (WHERE event_data->'context'->>'change_reason' IS NOT NULL) as switch_reasons,
        -- Simple effectiveness score: longer duration = more effective
        CASE 
            WHEN AVG((event_data->'previous_protocol'->>'duration_days')::NUMERIC) > 60 THEN 0.8
            WHEN AVG((event_data->'previous_protocol'->>'duration_days')::NUMERIC) > 30 THEN 0.6
            ELSE 0.4
        END as effectiveness_score
    FROM protocol_change_events
    WHERE created_at >= (now() - interval '%s days')
      AND event_data->>'change_type' = 'protocol_switch'
      AND event_data->'previous_protocol'->>'name' IS NOT NULL
    GROUP BY (event_data->'previous_protocol'->>'name')::VARCHAR
    ORDER BY avg_duration_days DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to update protocol phase
CREATE OR REPLACE FUNCTION advance_protocol_phase(
    p_user_id UUID,
    p_new_phase INTEGER,
    p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    current_protocol_id UUID;
    current_phase INTEGER;
    updated_data JSONB;
BEGIN
    -- Get current protocol info
    SELECT protocol_id, (protocol_data->>'current_phase')::INTEGER
    INTO current_protocol_id, current_phase
    FROM user_protocols
    WHERE user_id = p_user_id 
      AND (protocol_data->>'active')::BOOLEAN = true
      AND active = true
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF current_protocol_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update protocol_data with new phase
    UPDATE user_protocols
    SET protocol_data = protocol_data || jsonb_build_object(
        'current_phase', p_new_phase,
        'phase_history', protocol_data->'phase_history' || jsonb_build_array(
            jsonb_build_object(
                'phase', p_new_phase,
                'started', now()::date::text,
                'status', 'active',
                'notes', p_notes,
                'advanced_from_phase', current_phase
            )
        ),
        'last_phase_advance', now()::text
    )
    WHERE user_id = p_user_id 
      AND protocol_id = current_protocol_id
      AND active = true;
    
    -- Log phase advancement event
    INSERT INTO protocol_change_events (user_id, event_data)
    VALUES (
        p_user_id,
        jsonb_build_object(
            'change_type', 'phase_advance',
            'protocol', jsonb_build_object(
                'id', current_protocol_id::text
            ),
            'phase_change', jsonb_build_object(
                'from', current_phase,
                'to', p_new_phase,
                'advancement_reason', 'user_initiated'
            ),
            'context', jsonb_build_object(
                'notes', p_notes,
                'advanced_at', now()::text
            )
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMIT;
