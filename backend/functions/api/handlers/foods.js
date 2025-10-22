const { pool } = require('../database/connection');
const { successResponse, errorResponse } = require('../utils/responses');
const { handleDatabaseError } = require('../utils/errors');

/**
 * CLEAN FOODS API - Single source of truth approach
 * Uses foods_with_properties_mv materialized view for all queries
 */

const searchFoods = async (event) => {
    try {
        const { search = '', protocol_id, limit = 50, include_properties = false } = event.queryStringParameters || {};
        
        let query;
        let params;
        
        if (protocol_id) {
            // Protocol-based filtering
            query = `
                SELECT 
                    id,
                    display_name as name,
                    category_name as category,
                    subcategory_name as subcategory,
                    oxalate,
                    histamine,
                    lectin,
                    is_nightshade as nightshade,
                    fodmap,
                    salicylate,
                    'database' as source
                FROM foods_with_properties_mv
                WHERE ($1 = '' OR display_name ILIKE $1)
                ORDER BY display_name ASC
                LIMIT $2
            `;
            params = [`%${search}%`, parseInt(limit)];
        } else {
            // General search
            query = `
                SELECT 
                    id,
                    display_name as name,
                    category_name as category,
                    subcategory_name as subcategory,
                    ${include_properties ? 'oxalate, histamine, lectin, is_nightshade as nightshade, fodmap, salicylate,' : ''}
                    'database' as source
                FROM foods_with_properties_mv
                WHERE ($1 = '' OR display_name ILIKE $1)
                ORDER BY 
                    CASE WHEN display_name ILIKE $2 THEN 1 ELSE 2 END,
                    display_name ASC
                LIMIT $3
            `;
            params = [`%${search}%`, `${search}%`, parseInt(limit)];
        }
        
        const result = await pool.query(query, params);
        
        return successResponse({
            foods: result.rows,
            total: result.rows.length,
            search_term: search,
            protocol_id: protocol_id || null
        });
        
    } catch (error) {
        console.error('Food search error:', error);
        return errorResponse('Failed to search foods', 500);
    }
};

module.exports = {
    handleSearchFoods: searchFoods,
    handleGetCacheStats: () => ({ cache: 'disabled' })
};
