-- Health Platform Database Schema
-- SECURITY: All tables include proper user isolation and constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with security constraints
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_type VARCHAR(20) NOT NULL DEFAULT 'patient' CHECK (user_type IN ('patient', 'practitioner', 'admin')),
    is_active BOOLEAN DEFAULT true,
    is_demo_user BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- User sessions for refresh tokens
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- User preferences with JSON storage
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Journal entries (daily containers)
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, entry_date)
);

-- Timeline entries (individual health events)
CREATE TABLE timeline_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    entry_time TIME NOT NULL,
    entry_type VARCHAR(50) NOT NULL CHECK (entry_type IN ('symptom', 'food', 'supplement', 'medication', 'detox', 'exposure')),
    content JSONB NOT NULL,
    severity INTEGER CHECK (severity BETWEEN 1 AND 10),
    protocol_compliant BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Protocols (treatment protocols)
CREATE TABLE protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    phases JSONB,
    official BOOLEAN DEFAULT false,
    version VARCHAR(20) DEFAULT '1.0',
    is_global BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User protocols (user's active protocols)
CREATE TABLE user_protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
    current_phase INTEGER DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE,
    compliance_score DECIMAL(3,2) CHECK (compliance_score BETWEEN 0 AND 1),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, protocol_id, start_date)
);

-- Reference data tables (global, no user isolation needed)

-- Foods database
CREATE TABLE foods_database (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    histamine_level VARCHAR(20) CHECK (histamine_level IN ('low', 'medium', 'high', 'unknown')),
    fodmap_level VARCHAR(20) CHECK (fodmap_level IN ('low', 'medium', 'high', 'unknown')),
    aip_compliant BOOLEAN,
    synonyms TEXT[],
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Symptoms database
CREATE TABLE symptoms_database (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    synonyms TEXT[],
    severity_scale_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Supplements database
CREATE TABLE supplements_database (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    typical_dosage TEXT,
    synonyms TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medications database
CREATE TABLE medications_database (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    synonyms TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Exposure types
CREATE TABLE exposure_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Detox types
CREATE TABLE detox_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Protocol foods (which foods are allowed/avoided in protocols)
CREATE TABLE protocol_foods (
    protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES foods_database(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('allowed', 'avoided', 'reintroduce')),
    phase INTEGER,
    notes TEXT,
    PRIMARY KEY (protocol_id, food_id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, entry_date);
CREATE INDEX idx_timeline_entries_user_id ON timeline_entries(user_id);
CREATE INDEX idx_timeline_entries_journal_id ON timeline_entries(journal_entry_id);
CREATE INDEX idx_timeline_entries_type ON timeline_entries(entry_type);
CREATE INDEX idx_user_protocols_user_id ON user_protocols(user_id);
CREATE INDEX idx_user_protocols_active ON user_protocols(active);
CREATE INDEX idx_foods_name ON foods_database(name);
CREATE INDEX idx_symptoms_name ON symptoms_database(name);
CREATE INDEX idx_supplements_name ON supplements_database(name);

-- Row Level Security (RLS) for additional protection
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_protocols ENABLE ROW LEVEL SECURITY;

-- RLS Policies (example - would need to be customized based on auth system)
-- CREATE POLICY user_isolation ON users FOR ALL USING (id = current_user_id());
-- CREATE POLICY user_sessions_isolation ON user_sessions FOR ALL USING (user_id = current_user_id());
-- CREATE POLICY user_preferences_isolation ON user_preferences FOR ALL USING (user_id = current_user_id());
-- CREATE POLICY journal_entries_isolation ON journal_entries FOR ALL USING (user_id = current_user_id());
-- CREATE POLICY timeline_entries_isolation ON timeline_entries FOR ALL USING (user_id = current_user_id());
-- CREATE POLICY user_protocols_isolation ON user_protocols FOR ALL USING (user_id = current_user_id());

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timeline_entries_updated_at BEFORE UPDATE ON timeline_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_protocols_updated_at BEFORE UPDATE ON protocols FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_protocols_updated_at BEFORE UPDATE ON user_protocols FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
