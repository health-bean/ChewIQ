const { pool } = require('../database/connection');
const { successResponse, errorResponse } = require('../utils/responses');
const { handleDatabaseError } = require('../utils/errors');
const { getCurrentUser } = require('../middleware/auth');

/**
 * Protocol status helper functions
 * Used for consistent messaging across Track and Foods tabs
 */
const getProtocolStatusMessage = (status, protocolName) => {
    switch (status) {
        case 'included':
        case 'allowed':
            return `✅ Great choice for your ${protocolName} protocol`;
        case 'try_in_moderation':
        case 'moderation':
            return `⚖️ Enjoy in moderation on your ${protocolName} protocol`;
        case 'avoid_for_now':
        case 'avoid':
            return `❌ Best to avoid on your ${protocolName} protocol`;
        default:
            return `🔍 Not yet evaluated for your ${protocolName} protocol`;
    }
};

const getProtocolStatusIcon = (status) => {
    switch (status) {
        case 'included':
        case 'allowed':
            return '✅';
        case 'try_in_moderation':
        case 'moderation':
            return '⚖️';
        case 'avoid_for_now':
        case 'avoid':
            return '❌';
        default:
            return '🔍';
    }
};

/**
 * Normalize protocol status for consistent frontend handling
 */
const normalizeProtocolStatus = (status) => {
    switch (status) {
        case 'included':
            return 'allowed';
        case 'avoid_for_now':
            return 'avoid';
        case 'try_in_moderation':
            return 'moderation';
        default:
            return status;
    }
};

/**
 * Get user's active protocols for context-aware food search
 */
const getUserProtocols = async (client, userId) => {
    if (!userId) return [];
    
    const query = `
        SELECT 
            up.dietary_protocol_id as protocol_id, 
            p.name as protocol_name,
            up.current_phase
        FROM user_dietary_protocols up
        JOIN dietary_protocols p ON up.dietary_protocol_id = p.id
        WHERE up.user_id = $1 AND up.is_active = true
    `;
    
    const result = await client.query(query, [userId]);
    return result.rows;
};

/**
 * Enhanced food search with context awareness
 * Supports both Track tab (post-consumption logging) and Foods tab (protocol guidance)
 * 
 * Query Parameters:
 * - search: Search term
 * - context: 'track' | 'browse' (default: 'browse')
 * - limit: Max results (default: 20)
 */
const handleSearchFoods = async (queryParams, event) => {
    let client;
    try {
        client = await pool.connect();
        
        const search = queryParams.search?.trim() || '';
        const context = queryParams.context || 'browse'; // 'track' or 'browse'
        const limit = Math.min(parseInt(queryParams.limit) || 20, 50); // Cap at 50
        
        // Early return for empty search
        if (!search) {
            return successResponse({
                foods: [],
                total: 0,
                search_term: search,
                context
            });
        }
        
        // Get user context for protocol-aware results
        const user = await getCurrentUser(event);
        const userProtocols = user ? await getUserProtocols(client, user.id) : [];
        
        let foods;
        
        if (context === 'track') {
            // Track tab: Focus on food variants for accurate logging
            foods = await searchFoodsForTracking(client, search, limit, userProtocols);
        } else {
            // Foods tab: Focus on protocol guidance and education
            foods = await searchFoodsForBrowsing(client, search, limit, userProtocols);
        }
        
        return successResponse({
            foods,
            total: foods.length,
            search_term: search,
            context,
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

/**
 * Search foods for Track tab - optimized for quick logging
 * Prioritizes protocol foods but includes all foods for comprehensive tracking
 */
const searchFoodsForTracking = async (client, search, limit, userProtocols) => {
    const searchPattern = `%${search}%`;
    const exactMatch = search;
    const startsWithMatch = `${search}%`;
    
    let query;
    let params;
    
    if (userProtocols.length > 0) {
        // Protocol-aware search: protocol foods first, then all foods
        const protocolIds = userProtocols.map(p => p.protocol_id);
        
        query = `
            WITH protocol_foods AS (
                SELECT DISTINCT
                    fs.food_id,
                    fs.display_name,
                    fs.category_name,
                    fs.subcategory_name,
                    fs.preparation_state,
                    fs.is_organic,
                    fs.properties,
                    pf.protocol_status,
                    pf.dietary_protocol_name,
                    1 as priority -- Protocol foods get priority
                FROM mat_food_search fs
                JOIN mat_protocol_foods pf ON fs.food_id = pf.food_id
                WHERE fs.display_name ILIKE $1 
                AND pf.dietary_protocol_id = ANY($4)
            ),
            all_foods AS (
                SELECT 
                    food_id,
                    display_name,
                    category_name,
                    subcategory_name,
                    preparation_state,
                    is_organic,
                    properties,
                    null as protocol_status,
                    null as dietary_protocol_name,
                    2 as priority -- Non-protocol foods get lower priority
                FROM mat_food_search
                WHERE display_name ILIKE $1
                AND food_id NOT IN (SELECT food_id FROM protocol_foods)
            ),
            combined AS (
                SELECT * FROM protocol_foods
                UNION ALL
                SELECT * FROM all_foods
            )
            SELECT 
                food_id as id,
                display_name as name,
                category_name as category,
                subcategory_name as subcategory,
                preparation_state,
                is_organic,
                properties,
                protocol_status,
                dietary_protocol_name
            FROM combined
            ORDER BY 
                priority,
                CASE 
                    WHEN display_name ILIKE $2 THEN 1
                    WHEN display_name ILIKE $3 THEN 2
                    ELSE 3
                END,
                display_name ASC
            LIMIT $5
        `;
        
        params = [searchPattern, exactMatch, startsWithMatch, protocolIds, limit];
    } else {
        // No protocols: simple search
        query = `
            SELECT 
                food_id as id,
                display_name as name,
                category_name as category,
                subcategory_name as subcategory,
                preparation_state,
                is_organic,
                properties,
                null as protocol_status,
                null as dietary_protocol_name
            FROM mat_food_search
            WHERE display_name ILIKE $1
            ORDER BY 
                CASE 
                    WHEN display_name ILIKE $2 THEN 1
                    WHEN display_name ILIKE $3 THEN 2
                    ELSE 3
                END,
                display_name ASC
            LIMIT $4
        `;
        
        params = [searchPattern, exactMatch, startsWithMatch, limit];
    }
    
    const result = await client.query(query, params);
    
    // Add simplified protocol hints for Track tab
    return result.rows.map(food => ({
        ...food,
        protocol_hint: food.protocol_status ? {
            status: normalizeProtocolStatus(food.protocol_status),
            icon: getProtocolStatusIcon(food.protocol_status),
            message: getProtocolStatusMessage(food.protocol_status, food.dietary_protocol_name)
        } : null
    }));
};

/**
 * Search foods for Foods tab - optimized for protocol guidance and education
 * Includes rich educational information and detailed protocol compliance
 */
const searchFoodsForBrowsing = async (client, search, limit, userProtocols) => {
    const searchPattern = `%${search}%`;
    const exactMatch = search;
    const startsWithMatch = `${search}%`;
    
    if (userProtocols.length === 0) {
        // No protocols: basic search with educational info
        const query = `
            SELECT 
                food_id as id,
                display_name as name,
                category_name as category,
                subcategory_name as subcategory,
                preparation_state,
                is_organic,
                properties,
                histamine,
                oxalate,
                lectin,
                fodmap,
                salicylate,
                nightshade
            FROM mat_food_search
            WHERE display_name ILIKE $1
            ORDER BY 
                CASE 
                    WHEN display_name ILIKE $2 THEN 1
                    WHEN display_name ILIKE $3 THEN 2
                    ELSE 3
                END,
                display_name ASC
            LIMIT $4
        `;
        
        const result = await client.query(query, [searchPattern, exactMatch, startsWithMatch, limit]);
        return result.rows.map(food => ({ ...food, protocol_compliance: [] }));
    }
    
    // Protocol-aware search with full educational context
    const protocolIds = userProtocols.map(p => p.protocol_id);
    
    const query = `
        SELECT DISTINCT
            fs.food_id as id,
            fs.display_name as name,
            fs.category_name as category,
            fs.subcategory_name as subcategory,
            fs.preparation_state,
            fs.is_organic,
            fs.properties,
            fs.histamine,
            fs.oxalate,
            fs.lectin,
            fs.fodmap,
            fs.salicylate,
            fs.nightshade,
            json_agg(
                json_build_object(
                    'protocol_name', pf.dietary_protocol_name,
                    'status', pf.protocol_status,
                    'normalized_status', CASE pf.protocol_status
                        WHEN 'included' THEN 'allowed'
                        WHEN 'avoid_for_now' THEN 'avoid'
                        WHEN 'try_in_moderation' THEN 'moderation'
                        ELSE pf.protocol_status
                    END,
                    'phase', pf.protocol_phase,
                    'notes', pf.protocol_notes,
                    'icon', CASE pf.protocol_status
                        WHEN 'included' THEN '✅'
                        WHEN 'try_in_moderation' THEN '⚖️'
                        WHEN 'avoid_for_now' THEN '❌'
                        ELSE '🔍'
                    END,
                    'message', CASE pf.protocol_status
                        WHEN 'included' THEN '✅ Great choice for your ' || pf.dietary_protocol_name || ' protocol'
                        WHEN 'try_in_moderation' THEN '⚖️ Enjoy in moderation on your ' || pf.dietary_protocol_name || ' protocol'
                        WHEN 'avoid_for_now' THEN '❌ Best to avoid on your ' || pf.dietary_protocol_name || ' protocol'
                        ELSE '🔍 Not yet evaluated for your ' || pf.dietary_protocol_name || ' protocol'
                    END
                )
            ) FILTER (WHERE pf.food_id IS NOT NULL) as protocol_compliance
        FROM mat_food_search fs
        LEFT JOIN mat_protocol_foods pf ON fs.food_id = pf.food_id 
            AND pf.dietary_protocol_id = ANY($4)
        WHERE fs.display_name ILIKE $1
        GROUP BY fs.food_id, fs.display_name, fs.category_name, fs.subcategory_name, 
                 fs.preparation_state, fs.is_organic, fs.properties, fs.histamine, 
                 fs.oxalate, fs.lectin, fs.fodmap, fs.salicylate, fs.nightshade
        ORDER BY 
            CASE 
                WHEN fs.display_name ILIKE $2 THEN 1
                WHEN fs.display_name ILIKE $3 THEN 2
                ELSE 3
            END,
            fs.display_name ASC
        LIMIT $5
    `;
    
    const result = await client.query(query, [searchPattern, exactMatch, startsWithMatch, protocolIds, limit]);
    
    return result.rows.map(food => ({
        ...food,
        protocol_compliance: food.protocol_compliance || []
    }));
};

/**
 * Get protocol foods for pre-loading (Track tab initialization)
 * Optimized for fast loading of user's protocol-compliant foods
 * 
 * Query Parameters:
 * - protocol_id: Optional specific protocol (uses user's active protocols if not provided)
 * - status: Optional filter by status ('allowed', 'avoid', 'moderation')
 * - limit: Max results (default: 100)
 */
const handleGetProtocolFoods = async (queryParams, event) => {
    let client;
    try {
        client = await pool.connect();
        
        const user = await getCurrentUser(event);
        if (!user) {
            return errorResponse('Authentication required', 401);
        }
        
        const protocolId = queryParams.protocol_id;
        const statusFilter = queryParams.status;
        const limit = Math.min(parseInt(queryParams.limit) || 100, 500); // Cap at 500
        
        let protocolIds;
        let protocolNames = {};
        
        if (protocolId) {
            // Specific protocol requested
            protocolIds = [protocolId];
            const protocolQuery = `SELECT id, name FROM dietary_protocols WHERE id = $1`;
            const protocolResult = await client.query(protocolQuery, [protocolId]);
            if (protocolResult.rows.length === 0) {
                return errorResponse('Protocol not found', 404);
            }
            protocolNames[protocolId] = protocolResult.rows[0].name;
        } else {
            // Use user's active protocols
            const userProtocols = await getUserProtocols(client, user.id);
            if (userProtocols.length === 0) {
                return successResponse({
                    foods: [],
                    total: 0,
                    protocols: [],
                    status_filter: statusFilter
                });
            }
            protocolIds = userProtocols.map(p => p.protocol_id);
            userProtocols.forEach(p => {
                protocolNames[p.protocol_id] = p.protocol_name;
            });
        }
        
        // Build query with optional status filter
        let query = `
            SELECT 
                food_id as id,
                display_name as name,
                category_name as category,
                subcategory_name as subcategory,
                dietary_protocol_id as protocol_id,
                dietary_protocol_name as protocol_name,
                protocol_status,
                protocol_phase,
                protocol_notes,
                histamine,
                oxalate,
                lectin,
                fodmap,
                salicylate,
                nightshade
            FROM mat_protocol_foods
            WHERE dietary_protocol_id = ANY($1)
        `;
        
        const params = [protocolIds];
        
        if (statusFilter) {
            query += ` AND protocol_status = $2`;
            params.push(statusFilter);
        }
        
        query += `
            ORDER BY 
                protocol_status = 'included' DESC,
                protocol_status = 'try_in_moderation' DESC,
                category_name,
                display_name
            LIMIT $${params.length + 1}
        `;
        params.push(limit);
        
        const result = await client.query(query, params);
        
        // Group foods by status for easy frontend consumption
        const foodsByStatus = {
            allowed: [],
            moderation: [],
            avoid: [],
            unknown: []
        };
        
        const foods = result.rows.map(food => {
            const normalizedStatus = normalizeProtocolStatus(food.protocol_status);
            const processedFood = {
                ...food,
                normalized_status: normalizedStatus,
                icon: getProtocolStatusIcon(food.protocol_status),
                message: getProtocolStatusMessage(food.protocol_status, food.protocol_name)
            };
            
            // Group by status
            if (foodsByStatus[normalizedStatus]) {
                foodsByStatus[normalizedStatus].push(processedFood);
            } else {
                foodsByStatus.unknown.push(processedFood);
            }
            
            return processedFood;
        });
        
        return successResponse({
            foods,
            foods_by_status: foodsByStatus,
            total: foods.length,
            protocols: Object.entries(protocolNames).map(([id, name]) => ({ id, name })),
            status_filter: statusFilter,
            compliance_stats: {
                total: foods.length,
                allowed: foodsByStatus.allowed.length,
                moderation: foodsByStatus.moderation.length,
                avoid: foodsByStatus.avoid.length,
                unknown: foodsByStatus.unknown.length
            }
        });
        
    } catch (error) {
        console.error('Error in handleGetProtocolFoods:', error);
        const appError = handleDatabaseError(error, 'fetch protocol foods');
        return errorResponse(appError.message, appError.statusCode);
    } finally {
        if (client) {
            client.release();
        }
    }
};

module.exports = {
    handleSearchFoods,
    handleGetProtocolFoods
};
