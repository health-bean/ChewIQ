const { pool } = require('../database/connection');
const { successResponse, errorResponse } = require('../utils/responses');
const { handleDatabaseError } = require('../utils/errors');

const handleSearchFoods = async (queryParams) => {
    try {
        const client = await pool.connect();
        const protocol_id = queryParams.protocol_id || queryParams.dietary_protocol_id;
        const search = queryParams.search || '';
        const searchPattern = `%${search}%`;
        
        // Use mat_food_search with correct column names
        const query = `
            SELECT 
                food_id as id,
                display_name as name,
                category_name as category,
                subcategory_name as subcategory,
                preparation_state,
                is_organic,
                'unknown' as protocol_status
            FROM mat_food_search
            WHERE display_name ILIKE $1
            ORDER BY display_name ASC
            LIMIT 10
        `;
        const values = [searchPattern];
        
        console.log('Executing food search query:', query);
        console.log('With values:', values);
        
        const result = await client.query(query, values);
        client.release();
        
        console.log(`Found ${result.rows.length} food results`);
        
        const foods = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            category: row.category,
            subcategory: row.subcategory,
            preparation_state: row.preparation_state,
            is_organic: row.is_organic,
            protocol_status: row.protocol_status
        }));
        
        return successResponse({
            foods,
            total: foods.length,
            search_term: search
        });
        
    } catch (error) {
        console.error('Error in handleSearchFoods:', error);
        const appError = handleDatabaseError(error, 'search foods');
        return errorResponse(appError.message, appError.statusCode);
    }
};

const handleGetProtocolFoods = async (queryParams) => {
    try {
        const protocol_id = queryParams.protocol_id || queryParams.dietary_protocol_id;
        
        if (!protocol_id) {
            return errorResponse('protocol_id or dietary_protocol_id parameter is required', 400);
        }
        
        // Since mat_protocol_foods is empty, return a placeholder response
        // but still return foods from mat_food_search for now
        const client = await pool.connect();
        
        const query = `
            SELECT 
                food_id as id,
                display_name as name,
                category_name as category,
                subcategory_name as subcategory,
                preparation_state,
                is_organic,
                'unknown' as protocol_status
            FROM mat_food_search
            ORDER BY category_name ASC, display_name ASC
            LIMIT 100
        `;
        
        const result = await client.query(query);
        client.release();
        
        // Group by category for frontend
        const foodsByCategory = {};
        const foodsByStatus = {
            allowed: [],
            avoid: [],
            reintroduction: [],
            unknown: result.rows
        };
        
        result.rows.forEach(food => {
            const category = food.category || 'Other';
            
            // Group by category
            if (!foodsByCategory[category]) {
                foodsByCategory[category] = [];
            }
            foodsByCategory[category].push(food);
        });
        
        return successResponse({
            foods: result.rows,
            foods_by_category: foodsByCategory,
            foods_by_status: foodsByStatus,
            compliance_stats: {
                total: result.rows.length,
                allowed: 0,
                avoid: 0,
                reintroduction: 0,
                unknown: result.rows.length
            },
            protocol_id
        });
        
    } catch (error) {
        console.error('Error in handleGetProtocolFoods:', error);
        const appError = handleDatabaseError(error, 'fetch protocol foods');
        return errorResponse(appError.message, appError.statusCode);
    }
};

module.exports = {
    handleSearchFoods,
    handleGetProtocolFoods
};
