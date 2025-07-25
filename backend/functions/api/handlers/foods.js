const { pool } = require('../database/connection');
const { successResponse, errorResponse } = require('../utils/responses');
const { handleDatabaseError } = require('../utils/errors');
const { getCurrentUser } = require('../middleware/auth');

const handleSearchFoods = async (queryParams, event) => {
    let client;
    try {
        client = await pool.connect();
        const search = queryParams.search || '';
        
        // Use trigram search for better partial matching
        const searchPattern = `%${search}%`;
        
        // Get current user to check their active protocols
        const user = await getCurrentUser(event);
        let userProtocols = [];
        
        if (user) {
            const protocolQuery = `
                SELECT up.dietary_protocol_id as protocol_id, p.name as protocol_name
                FROM user_dietary_protocols up
                JOIN dietary_protocols p ON up.dietary_protocol_id = p.id
                WHERE up.user_id = $1 AND up.is_active = true
            `;
            const protocolResult = await client.query(protocolQuery, [user.id]);
            userProtocols = protocolResult.rows;
        }
        
        // SIMPLIFIED: Basic food search first, then add protocol info if needed
        const foodQuery = `
            SELECT 
                food_id as id,
                display_name as name,
                category_name as category,
                subcategory_name as subcategory,
                preparation_state,
                is_organic,
                properties
            FROM mat_food_search
            WHERE display_name ILIKE $1
            ORDER BY 
                CASE 
                    WHEN display_name ILIKE $2 THEN 1  -- Exact match first
                    WHEN display_name ILIKE $3 THEN 2  -- Starts with search term
                    ELSE 3                             -- Contains search term
                END,
                display_name ASC
            LIMIT 20
        `;
        
        const exactMatch = search;
        const startsWithMatch = `${search}%`;
        const containsMatch = searchPattern;
        
        const dbQueryParams = [containsMatch, exactMatch, startsWithMatch];
        const foodResult = await client.query(foodQuery, dbQueryParams);
        
        // Add protocol status if user has protocols
        let foodsWithProtocols = foodResult.rows;
        if (userProtocols.length > 0 && foodResult.rows.length > 0) {
            const foodIds = foodResult.rows.map(f => f.id);
            const protocolIds = userProtocols.map(p => p.protocol_id);
            
            const protocolQuery = `
                SELECT 
                    pf.food_id,
                    pf.dietary_protocol_name as protocol_name,
                    CASE pf.protocol_status
                        WHEN 'included' THEN 'allowed'
                        WHEN 'avoid_for_now' THEN 'avoid'
                        WHEN 'try_in_moderation' THEN 'moderation'
                        ELSE pf.protocol_status
                    END as status,
                    pf.protocol_phase as phase,
                    pf.protocol_notes as notes
                FROM mat_protocol_foods pf
                WHERE pf.food_id = ANY($1) AND pf.dietary_protocol_id = ANY($2)
            `;
            
            const protocolResult = await client.query(protocolQuery, [foodIds, protocolIds]);
            const protocolMap = {};
            
            protocolResult.rows.forEach(row => {
                if (!protocolMap[row.food_id]) {
                    protocolMap[row.food_id] = [];
                }
                protocolMap[row.food_id].push({
                    protocol_name: row.protocol_name,
                    status: row.status,
                    phase: row.phase,
                    notes: row.notes,
                    display_message: getStatusMessage(row.status, row.protocol_name),
                    icon: getStatusIcon(row.status)
                });
            });
            
            foodsWithProtocols = foodResult.rows.map(food => ({
                ...food,
                protocol_status: protocolMap[food.id] || []
            }));
        } else {
            foodsWithProtocols = foodResult.rows.map(food => ({
                ...food,
                protocol_status: []
            }));
        }
        
        return successResponse({
            foods: foodsWithProtocols,
            total: foodsWithProtocols.length,
            search_term: search,
            user_protocols: userProtocols.map(p => p.protocol_name)
        });
        
    } catch (error) {
        console.error('Error in handleSearchFoods:', error);
        const appError = handleDatabaseError(error, 'search foods');
        return errorResponse(appError.message, appError.statusCode);
    } finally {
        if (client) {
            client.release();
        }
    }
};

// Helper functions for protocol status
const getStatusMessage = (status, protocolName) => {
    switch (status) {
        case 'allowed':
            return `✅ Great choice for your ${protocolName} protocol`;
        case 'moderation':
            return `⚖️ Enjoy in moderation on your ${protocolName} protocol`;
        case 'avoid':
            return `❌ Best to avoid on your ${protocolName} protocol`;
        default:
            return `🔍 Not yet evaluated for your ${protocolName} protocol`;
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'allowed':
            return '✅';
        case 'moderation':
            return '⚖️';
        case 'avoid':
            return '❌';
        default:
            return '🔍';
    }
};

const handleGetProtocolFoods = async (queryParams, event) => {
    try {
        const protocol_id = queryParams.protocol_id || queryParams.dietary_protocol_id;
        
        if (!protocol_id) {
            return errorResponse('protocol_id parameter is required', 400);
        }
        
        const client = await pool.connect();
        
        // Updated query to match the new database structure
        const query = `
            SELECT 
                dp.name as protocol_name,
                COUNT(*) as total_foods,
                COUNT(*) FILTER (WHERE pf.protocol_status = 'included') as allowed_count,
                COUNT(*) FILTER (WHERE pf.protocol_status = 'avoid') as avoid_count,
                COUNT(*) FILTER (WHERE pf.protocol_status = 'moderation') as moderation_count,
                json_object_agg(
                    CASE pf.protocol_status
                        WHEN 'included' THEN 'allowed'
                        WHEN 'avoid' THEN 'avoid'
                        WHEN 'moderation' THEN 'moderation'
                        ELSE 'unknown'
                    END,
                    foods_array
                ) as foods_by_status
            FROM dietary_protocols dp
            LEFT JOIN (
                SELECT 
                    pf.dietary_protocol_id,
                    pf.protocol_status,
                    json_agg(
                        json_build_object(
                            'id', pf.food_id,
                            'name', pf.display_name,
                            'category', pf.category_name,
                            'subcategory', pf.subcategory_name,
                            'protocol_status', CASE pf.protocol_status
                                WHEN 'included' THEN 'allowed'
                                WHEN 'avoid' THEN 'avoid'
                                WHEN 'moderation' THEN 'moderation'
                                ELSE 'unknown'
                            END,
                            'protocol_phase', pf.protocol_phase,
                            'protocol_notes', pf.protocol_notes,
                            'display_message', 
                                CASE pf.protocol_status
                                    WHEN 'included' THEN '✅ Great choice for your ' || dp_inner.name || ' protocol'
                                    WHEN 'moderation' THEN '⚖️ Enjoy in moderation on your ' || dp_inner.name || ' protocol'
                                    WHEN 'avoid' THEN '❌ Best to avoid on your ' || dp_inner.name || ' protocol'
                                    ELSE '🔍 Not yet evaluated for your ' || dp_inner.name || ' protocol'
                                END,
                            'icon',
                                CASE pf.protocol_status
                                    WHEN 'included' THEN '✅'
                                    WHEN 'moderation' THEN '⚖️'
                                    WHEN 'avoid' THEN '❌'
                                    ELSE '🔍'
                                END,
                            'rule_source', 'Pre-computed',
                            'properties', json_build_object(
                                'nightshade', pf.nightshade,
                                'histamine', pf.histamine,
                                'oxalate', pf.oxalate,
                                'lectin', pf.lectin,
                                'fodmap', pf.fodmap,
                                'salicylate', pf.salicylate
                            )
                        )
                        ORDER BY pf.category_name, pf.display_name
                    ) as foods_array
                FROM mat_protocol_foods pf
                JOIN dietary_protocols dp_inner ON pf.dietary_protocol_id = dp_inner.id
                WHERE pf.dietary_protocol_id = $1
                GROUP BY pf.dietary_protocol_id, pf.protocol_status
            ) pf ON dp.id = pf.dietary_protocol_id
            WHERE dp.id = $1
            GROUP BY dp.id, dp.name
        `;
        
        const result = await client.query(query, [protocol_id]);
        client.release();
        
        if (result.rows.length === 0) {
            return errorResponse('Protocol not found', 404);
        }
        
        const row = result.rows[0];
        const foodsByStatus = row.foods_by_status || {};
        
        // Ensure all status categories exist
        const cleanFoodsByStatus = {
            allowed: foodsByStatus.allowed || [],
            moderation: foodsByStatus.moderation || [],
            avoid: foodsByStatus.avoid || [],
            unknown: foodsByStatus.unknown || []
        };
        
        return successResponse({
            foods_by_status: cleanFoodsByStatus,
            compliance_stats: {
                total: row.total_foods || 0,
                allowed: row.allowed_count || 0,
                avoid: row.avoid_count || 0,
                moderation: row.moderation_count || 0,
                unknown: (row.total_foods || 0) - (row.allowed_count || 0) - (row.avoid_count || 0) - (row.moderation_count || 0)
            },
            protocol_id,
            protocol_name: row.protocol_name
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
