const { pool } = require('../database/connection');
const { successResponse, errorResponse } = require('../utils/responses');
const { handleDatabaseError } = require('../utils/errors');
const { getTenantContext } = require('../middleware/auth');

const handleGetProtocols = async (queryParams, event) => {
    try {
        const client = await pool.connect();
        
        const query = `
            SELECT 
                id,
                name,
                description,
                category,
                phases,
                official,
                version
            FROM protocols 
            WHERE is_global = true OR tenant_id IS NULL
            ORDER BY official DESC, name ASC
        `;
        
        const result = await client.query(query);
        client.release();
        
        return successResponse({
            protocols: result.rows,
            total: result.rows.length
        });
        
    } catch (error) {
        const appError = handleDatabaseError(error, 'fetch protocols');
        return errorResponse(appError.message, appError.statusCode);
    }
};

module.exports = {
    handleGetProtocols
};
