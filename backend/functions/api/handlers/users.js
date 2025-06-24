const { pool } = require('../database/connection');
const { successResponse, errorResponse } = require('../utils/responses');
const { handleDatabaseError } = require('../utils/errors');
const { getTenantContext } = require('../middleware/auth');

const handleGetUser = async (event) => {
    const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'patient@example.com',
        firstName: 'John',
        lastName: 'Doe', 
        role: 'patient',
        tenantId: '123e4567-e89b-12d3-a456-426614174001'
    };
    
    return successResponse({ user: mockUser });
};

const handleUpdateUser = async (body, event) => {
    return successResponse({
        message: 'User profile updated successfully',
        updatedFields: Object.keys(body)
    });
};

const handleGetUserProtocols = async (event) => {
    try {
        const client = await pool.connect();
        const { userId, tenantId } = getTenantContext(event);
        
        const query = `
            SELECT 
                up.id,
                up.current_phase,
                up.start_date,
                up.end_date,
                up.compliance_score,
                up.active,
                p.id as protocol_id,
                p.name as protocol_name,
                p.description,
                p.category,
                p.phases
            FROM user_protocols up
            JOIN protocols p ON up.protocol_id = p.id
            WHERE up.user_id = $1 AND up.tenant_id = $2 AND up.active = true
            ORDER BY up.start_date DESC
        `;
        
        const result = await client.query(query, [userId, tenantId]);
        client.release();
        
        return successResponse({
            protocols: result.rows,
            total: result.rows.length
        });
        
    } catch (error) {
        const appError = handleDatabaseError(error, 'fetch user protocols');
        return errorResponse(appError.message, appError.statusCode);
    }
};

const handleGetUserPreferences = async (event) => {
    // Mock user preferences for now - replace with real database later
    const mockPreferences = {
        protocols: ['1495844a-19de-404c-a288-7660eda0cbe1'], // AIP Elimination
        quick_supplements: [
            { id: 'vit_d_1', name: 'Vitamin D 5000 IU', category: 'vitamin' }
        ],
        quick_medications: [],
        quick_foods: [
            { id: 'chicken_1', name: 'Chicken breast', category: 'protein' }
        ],
        quick_symptoms: [
            { id: 'joint_1', name: 'Joint Pain', category: 'pain' }
        ],
        setup_complete: true
    };
    
    return successResponse(mockPreferences);
};

const handleUpdateUserPreferences = async (body, event) => {
    // For now, just return success - replace with real database save later
    return successResponse({
        message: 'User preferences updated successfully',
        preferences: body
    });
};

module.exports = {
    handleGetUser,
    handleUpdateUser,
    handleGetUserProtocols,
    handleGetUserPreferences,
    handleUpdateUserPreferences
};
