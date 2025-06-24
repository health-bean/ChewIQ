const { pool } = require('../database/connection');
const { successResponse, errorResponse } = require('../utils/responses');
const { handleDatabaseError } = require('../utils/errors');
const { getTenantContext } = require('../middleware/auth');

const handleGetJournalEntries = async (queryParams, event) => {
    try {
        const client = await pool.connect();
        const { userId, tenantId } = getTenantContext(event);
        
        const query = `
            SELECT 
                entry_date,
                bedtime,
                wake_time,
                sleep_quality,
                overall_feeling,
                stress_level,
                created_at,
                updated_at
            FROM journal_entries 
            WHERE user_id = $1 AND tenant_id = $2
            ORDER BY entry_date DESC
            LIMIT 30
        `;
        
        const result = await client.query(query, [userId, tenantId]);
        client.release();
        
        return successResponse({
            entries: result.rows,
            total: result.rows.length
        });
        
    } catch (error) {
        const appError = handleDatabaseError(error, 'fetch journal entries');
        return errorResponse(appError.message, appError.statusCode);
    }
};

const handleCreateJournalEntry = async (body, event) => {
    try {
        const client = await pool.connect();
        const { userId, tenantId } = getTenantContext(event);
        
        const {
            entryDate,
            bedtime,
            wakeTime,
            sleepQuality,
            overallFeeling,
            stressLevel
        } = body;
        
        const query = `
            INSERT INTO journal_entries (
                tenant_id, user_id, entry_date, bedtime, wake_time,
                sleep_quality, overall_feeling, stress_level
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (tenant_id, user_id, entry_date) 
            DO UPDATE SET
                bedtime = EXCLUDED.bedtime,
                wake_time = EXCLUDED.wake_time,
                sleep_quality = EXCLUDED.sleep_quality,
                overall_feeling = EXCLUDED.overall_feeling,
                stress_level = EXCLUDED.stress_level,
                updated_at = NOW()
            RETURNING *
        `;
        
        const values = [tenantId, userId, entryDate, bedtime, wakeTime, sleepQuality, overallFeeling, stressLevel];
        const result = await client.query(query, values);
        client.release();
        
        return successResponse({
            message: 'Journal entry created successfully',
            entry: result.rows[0]
        }, 201);
        
    } catch (error) {
        const appError = handleDatabaseError(error, 'create journal entry');
        return errorResponse(appError.message, appError.statusCode);
    }
};

const handleGetJournalEntry = async (date, event) => {
    try {
        const client = await pool.connect();
        const { userId, tenantId } = getTenantContext(event);
        
        const query = `
            SELECT * FROM journal_entries 
            WHERE user_id = $1 AND tenant_id = $2 AND entry_date = $3
        `;
        
        const result = await client.query(query, [userId, tenantId, date]);
        client.release();
        
        if (result.rows.length === 0) {
            return errorResponse('Journal entry not found for this date', 404);
        }
        
        return successResponse({ entry: result.rows[0] });
        
    } catch (error) {
        const appError = handleDatabaseError(error, 'fetch journal entry');
        return errorResponse(appError.message, appError.statusCode);
    }
};

const handleUpdateJournalEntry = async (date, body, event) => {
    try {
        const client = await pool.connect();
        const { userId, tenantId } = getTenantContext(event);
        
        const updateFields = [];
        const values = [];
        let valueIndex = 1;
        
        const fieldMapping = {
            bedtime: 'bedtime',
            wakeTime: 'wake_time',
            sleepQuality: 'sleep_quality',
            overallFeeling: 'overall_feeling',
            stressLevel: 'stress_level'
        };
        
        for (const [bodyField, dbField] of Object.entries(fieldMapping)) {
            if (body[bodyField] !== undefined) {
                updateFields.push(`${dbField} = $${valueIndex}`);
                values.push(body[bodyField]);
                valueIndex++;
            }
        }
        
        if (updateFields.length === 0) {
            return errorResponse('No valid fields provided for update', 400);
        }
        
        updateFields.push(`updated_at = NOW()`);
        values.push(userId, tenantId, date);
        
        const query = `
            UPDATE journal_entries 
            SET ${updateFields.join(', ')}
            WHERE user_id = $${valueIndex} AND tenant_id = $${valueIndex + 1} AND entry_date = $${valueIndex + 2}
            RETURNING *
        `;
        
        const result = await client.query(query, values);
        client.release();
        
        if (result.rows.length === 0) {
            return errorResponse('Journal entry not found for this date', 404);
        }
        
        return successResponse({
            message: 'Journal entry updated successfully',
            entry: result.rows[0]
        });
        
    } catch (error) {
        const appError = handleDatabaseError(error, 'update journal entry');
        return errorResponse(appError.message, appError.statusCode);
    }
};

module.exports = {
    handleGetJournalEntries,
    handleCreateJournalEntry,
    handleGetJournalEntry,
    handleUpdateJournalEntry
};
