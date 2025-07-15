const { pool } = require('../database/connection');
const { successResponse, errorResponse } = require('../utils/responses');
const { handleDatabaseError } = require('../utils/errors');

const handleGetJournalEntries = async (queryParams, event) => {
    try {
        const client = await pool.connect();
        const userId = event.user.id;
        const { limit = 30, offset = 0 } = queryParams;
        
        const query = `
            SELECT 
                id,
                entry_date,
                reflection_data,
                consent_to_anonymize,
                created_at,
                updated_at
            FROM journal_entries
            WHERE user_id = $1
            ORDER BY entry_date DESC
            LIMIT $2 OFFSET $3
        `;
        
        const result = await client.query(query, [userId, limit, offset]);
        client.release();
        
        return successResponse({
            entries: result.rows,
            total: result.rows.length
        });
        
    } catch (error) {
        const appError = handleDatabaseError(error, 'get journal entries');
        return errorResponse(appError.message, appError.statusCode);
    }
};

const handleGetJournalEntry = async (date, event) => {
    try {
        console.log('🔍 Journal API: Getting entry for date:', date);
        console.log('🔍 Journal API: Event user:', event.user ? 'present' : 'missing');
        
        const client = await pool.connect();
        const userId = event.user?.id;
        
        if (!userId) {
            console.error('❌ Journal API: No user ID found in event');
            return errorResponse('User not authenticated', 401);
        }
        
        console.log('🔍 Journal API: User ID:', userId);
        console.log('🔍 Journal API: Date parameter:', date);
        
        const query = `
            SELECT 
                id,
                entry_date,
                reflection_data,
                consent_to_anonymize,
                created_at,
                updated_at
            FROM journal_entries
            WHERE user_id = $1 AND entry_date = $2
        `;
        
        console.log('🔍 Journal API: Executing query with params:', [userId, date]);
        const result = await client.query(query, [userId, date]);
        client.release();
        
        console.log('🔍 Journal API: Query result rows:', result.rows.length);
        
        if (result.rows.length === 0) {
            console.log('✅ Journal API: No entry found, returning null');
            return successResponse({
                entry: null,
                date: date
            });
        }
        
        console.log('✅ Journal API: Entry found, returning data');
        return successResponse({
            entry: result.rows[0]
        });
        
    } catch (error) {
        console.error('❌ Journal API Error:', error);
        console.error('❌ Journal API Error stack:', error.stack);
        const appError = handleDatabaseError(error, 'get journal entry');
        return errorResponse(appError.message, appError.statusCode);
    }
};

const handleCreateJournalEntry = async (body, event) => {
    try {
        console.log('🔍 Journal API: Creating entry with body:', body);
        
        const client = await pool.connect();
        const userId = event.user.id;
        const { 
            entry_date, 
            bedtime, wake_time, sleep_quality, sleep_symptoms = [],
            energy_level, mood_level, physical_comfort,
            activity_level,
            meditation_duration, meditation_practice,
            cycle_day, ovulation,
            personal_reflection
        } = body;
        
        // Structure data according to new JSONB format
        const reflectionData = {
            sleep: {
                bedtime: bedtime || null,
                wake_time: wake_time || null,
                sleep_quality: sleep_quality || null,
                sleep_symptoms: sleep_symptoms || []
            },
            wellness: {
                energy_level: energy_level || null,
                mood_level: mood_level || null,
                physical_comfort: physical_comfort || null
            },
            activity: {
                activity_level: activity_level || null
            },
            meditation: {
                meditation_duration: meditation_duration || 0,
                meditation_practice: (meditation_duration && meditation_duration > 0) || meditation_practice || false
            },
            cycle: {
                cycle_day: cycle_day || null,
                ovulation: ovulation || false
            },
            notes: {
                personal_reflection: personal_reflection || null
            }
        };
        
        console.log('🔍 Journal API: User ID:', userId);
        console.log('🔍 Journal API: Entry date:', entry_date);
        console.log('🔍 Journal API: Structured reflection data:', JSON.stringify(reflectionData, null, 2));
        
        await client.query('BEGIN');
        
        // Insert or update journal entry with JSONB structure
        const journalQuery = `
            INSERT INTO journal_entries (
                user_id, entry_date, reflection_data, consent_to_anonymize
            ) VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, entry_date) 
            DO UPDATE SET
                reflection_data = EXCLUDED.reflection_data,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id
        `;
        
        const journalResult = await client.query(journalQuery, [
            userId, 
            entry_date, 
            JSON.stringify(reflectionData),
            false // Default consent_to_anonymize
        ]);
        
        const journalEntryId = journalResult.rows[0].id;
        console.log('🔍 Journal API: Journal entry created/updated with ID:', journalEntryId);
        
        // Handle sleep symptoms - add to timeline_entries
        if (sleep_symptoms && sleep_symptoms.length > 0) {
            console.log('🔍 Journal API: Processing sleep symptoms:', sleep_symptoms.length);
            
            // First, remove existing sleep symptoms for this date
            await client.query(`
                DELETE FROM timeline_entries 
                WHERE user_id = $1 
                  AND entry_date = $2 
                  AND entry_type = 'symptom'
                  AND structured_content->>'entry_source' = 'daily_reflection'
            `, [userId, entry_date]);
            
            // Insert new sleep symptoms
            for (const symptom of sleep_symptoms) {
                const timelineQuery = `
                    INSERT INTO timeline_entries (
                        user_id, journal_entry_id, entry_date, entry_time,
                        entry_type, content, severity, structured_content
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `;
                
                const structuredContent = {
                    entry_source: 'daily_reflection',
                    symptom_name: symptom.name,
                    severity: symptom.severity,
                    context: 'sleep_related'
                };
                
                await client.query(timelineQuery, [
                    userId,
                    journalEntryId,
                    entry_date,
                    '23:59:00', // Default end-of-day time for reflection symptoms
                    'symptom',
                    symptom.name,
                    symptom.severity,
                    JSON.stringify(structuredContent)
                ]);
            }
        }
        
        await client.query('COMMIT');
        client.release();
        
        console.log('✅ Journal API: Entry saved successfully');
        return successResponse({
            message: 'Journal entry saved successfully',
            entry_id: journalEntryId,
            sleep_symptoms_added: sleep_symptoms.length
        });
        
    } catch (error) {
        console.error('❌ Journal API Create Error:', error);
        await client.query('ROLLBACK');
        client.release();
        const appError = handleDatabaseError(error, 'create journal entry');
        return errorResponse(appError.message, appError.statusCode);
    }
};

const handleUpdateJournalEntry = async (date, body, event) => {
    // For now, just call create which handles upsert
    return handleCreateJournalEntry({ ...body, entry_date: date }, event);
};

module.exports = {
    handleGetJournalEntries,
    handleCreateJournalEntry,
    handleGetJournalEntry,
    handleUpdateJournalEntry
};
