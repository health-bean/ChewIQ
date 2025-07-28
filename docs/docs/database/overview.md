# Database Architecture

This document provides comprehensive information about the Health Platform database architecture, schema, and best practices.

## 🗄️ Database Overview

The Health Platform uses **PostgreSQL 14+** with **JSONB** for flexible, structured health data storage.

### Key Features
- **JSONB-First Design**: Flexible schema for health data
- **GIN Indexes**: Optimized JSONB queries
- **ACID Compliance**: Reliable transactions
- **Audit Logging**: Complete data access tracking
- **Encryption**: Data encrypted at rest and in transit

## 📊 Database Schema

### Core Tables

> **📋 Food Database**: For comprehensive food database documentation including USDA integration, see [Food Database Architecture](./food-database.md)

#### **users**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    user_type VARCHAR(20) DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

#### **journal_entries** (Reflection Data)
```sql
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    entry_date DATE NOT NULL,
    reflection_data JSONB DEFAULT '{}',
    consent_to_anonymize BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    UNIQUE(user_id, entry_date)
);

-- Indexes for performance
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, entry_date);
CREATE INDEX idx_journal_reflection_data_gin ON journal_entries USING gin(reflection_data);
```

#### **timeline_entries** (Event Data)
```sql
CREATE TABLE timeline_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID REFERENCES journal_entries(id),
    user_id UUID REFERENCES users(id),
    entry_time TIME NOT NULL,
    entry_type VARCHAR(50) NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    structured_content JSONB,
    created_at TIMESTAMP DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_timeline_entries_user_date ON timeline_entries(user_id, entry_date);
CREATE INDEX idx_timeline_structured_content_gin ON timeline_entries USING gin(structured_content);
CREATE INDEX idx_timeline_structured_content_type ON timeline_entries((structured_content ->> 'type'));
```

## 🏗️ JSONB Data Structures

### Journal Entry Reflection Data
```json
{
  "sleep": {
    "bedtime": "22:30",
    "wake_time": "07:00",
    "sleep_quality": "good",
    "sleep_symptoms": ["back pain", "restless"]
  },
  "wellness": {
    "energy_level": 8,
    "mood_level": 7,
    "physical_comfort": 6,
    "stress_level": 4
  },
  "activity": {
    "activity_level": "moderate"
  },
  "meditation": {
    "meditation_duration": 15,
    "meditation_practice": true
  },
  "cycle": {
    "cycle_day": "5",
    "ovulation": false
  },
  "notes": {
    "personal_reflection": "Feeling good today, energy was high after morning walk."
  }
}
```

### Timeline Entry Structured Content

#### Food Entry
```json
{
  "type": "food",
  "entry_source": "timed_entry",
  "foods": [{
    "name": "grilled chicken",
    "food_id": "uuid-here",
    "category": "protein",
    "compliance_status": "included",
    "protocol_allowed": true
  }],
  "notes": "Lunch - felt good after eating"
}
```

#### Symptom Entry
```json
{
  "type": "symptom",
  "entry_source": "timed_entry",
  "symptom": {
    "name": "headache",
    "severity": 6,
    "duration_minutes": 120
  },
  "notes": "Started after lunch, mild throbbing"
}
```

## 🔍 Query Examples

### Basic JSONB Queries

#### Get User's Sleep Data
```sql
SELECT 
    entry_date,
    reflection_data->'sleep'->>'bedtime' as bedtime,
    reflection_data->'sleep'->>'wake_time' as wake_time,
    reflection_data->'sleep'->>'sleep_quality' as sleep_quality
FROM journal_entries 
WHERE user_id = $1 
    AND entry_date >= $2 
    AND reflection_data->'sleep' IS NOT NULL
ORDER BY entry_date DESC;
```

#### Get Energy Levels Over Time
```sql
SELECT 
    entry_date,
    (reflection_data->'wellness'->>'energy_level')::int as energy_level,
    (reflection_data->'wellness'->>'mood_level')::int as mood_level
FROM journal_entries 
WHERE user_id = $1 
    AND reflection_data->'wellness'->>'energy_level' IS NOT NULL
ORDER BY entry_date DESC
LIMIT 30;
```

## 🚀 Performance Optimization

### Indexes

#### GIN Indexes for JSONB
```sql
-- General JSONB search
CREATE INDEX idx_journal_reflection_data_gin 
ON journal_entries USING gin(reflection_data);

CREATE INDEX idx_timeline_structured_content_gin 
ON timeline_entries USING gin(structured_content);

-- Specific path indexes for common queries
CREATE INDEX idx_timeline_content_type 
ON timeline_entries((structured_content ->> 'type'));

CREATE INDEX idx_journal_energy_level 
ON journal_entries((reflection_data->'wellness'->>'energy_level'));
```

### Query Performance Tips

1. **Use Specific Paths**: `reflection_data->'sleep'->>'bedtime'` is faster than searching entire JSONB
2. **Index Common Paths**: Create indexes for frequently queried JSONB paths
3. **Limit Results**: Always use LIMIT for large datasets
4. **Use EXISTS**: For checking JSONB key existence, use `reflection_data ? 'sleep'`

## 🔒 Security & Compliance

### Data Encryption
- **At Rest**: PostgreSQL transparent data encryption
- **In Transit**: SSL/TLS for all connections
- **Application Level**: Sensitive fields can be encrypted before JSONB storage

### Access Control
```sql
-- Role-based access
CREATE ROLE app_user;
GRANT SELECT, INSERT, UPDATE ON journal_entries TO app_user;
GRANT SELECT, INSERT, UPDATE ON timeline_entries TO app_user;

-- Read-only analytics role
CREATE ROLE analytics_user;
GRANT SELECT ON journal_entries TO analytics_user;
GRANT SELECT ON timeline_entries TO analytics_user;
```

## 📋 Best Practices

### JSONB Design
1. **Consistent Structure**: Use the same JSONB schema across entries
2. **Avoid Deep Nesting**: Keep JSONB structure relatively flat (2-3 levels max)
3. **Use Appropriate Types**: Store numbers as numbers, not strings
4. **Index Common Paths**: Create indexes for frequently queried JSONB paths

### Performance
1. **Use Specific Queries**: Query specific JSONB paths rather than entire documents
2. **Limit Results**: Always use LIMIT for user-facing queries
3. **Monitor Query Performance**: Use pg_stat_statements to identify slow queries
4. **Regular Maintenance**: VACUUM and ANALYZE JSONB tables regularly

---

**Last Updated**: July 19, 2025  
**Database Version**: PostgreSQL 14+ with JSONB  
**Schema Version**: 2.0 (Post-JSONB Migration)