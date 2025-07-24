const { pool } = require('../database/connection');
const { successResponse, errorResponse } = require('../utils/responses');
const { handleDatabaseError } = require('../utils/errors');
const { getCurrentUser } = require('../middleware/auth');

const handleSearchFoods = async (queryParams, event) => {
    try {
        const client = await pool.connect();
        const search = queryParams.search || '';
        const searchPattern = `%${search}%`;
        
        // Get current user to check their active protocols
        const user = await getCurrentUser(event);
        let userProtocols = [];
        
        if (user) {
            const protocolQuery = `
                SELECT up.protocol_id, p.name as protocol_name
                FROM user_protocols up
                JOIN protocols p ON up.protocol_id = p.id
                WHERE up.user_id = $1 AND up.is_active = true
            `;
            const protocolResult = await client.query(protocolQuery, [user.id]);
            userProtocols = protocolResult.rows;
        }
        
        // Get foods matching search
        const foodQuery = `
            SELECT 
                food_id as id,
                display_name as name,
                category_name as category,
                subcategory_name as subcategory,
                preparation_state,
                is_organic,
                properties,
                nightshade,
                histamine,
                oxalate,
                lectin,
                fodmap,
                salicylate
            FROM mat_food_search
            WHERE display_name ILIKE $1
            ORDER BY display_name ASC
            LIMIT 10
        `;
        
        const foodResult = await client.query(foodQuery, [searchPattern]);
        
        // For each food, compute protocol compliance
        const foods = [];
        for (const food of foodResult.rows) {
            const foodWithCompliance = {
                id: food.id,
                name: food.name,
                category: food.category,
                subcategory: food.subcategory,
                preparation_state: food.preparation_state,
                is_organic: food.is_organic,
                properties: food.properties
            };
            
            if (userProtocols.length > 0) {
                foodWithCompliance.protocol_status = [];
                
                for (const protocol of userProtocols) {
                    const compliance = await computeProtocolCompliance(
                        client, 
                        food, 
                        protocol.protocol_id, 
                        protocol.protocol_name
                    );
                    foodWithCompliance.protocol_status.push(compliance);
                }
            }
            
            foods.push(foodWithCompliance);
        }
        
        client.release();
        
        return successResponse({
            foods,
            total: foods.length,
            search_term: search,
            user_protocols: userProtocols.map(p => p.protocol_name)
        });
        
    } catch (error) {
        console.error('Error in handleSearchFoods:', error);
        const appError = handleDatabaseError(error, 'search foods');
        return errorResponse(appError.message, appError.statusCode);
    }
};

/**
 * Smart protocol compliance computation using property-based rules with admin overrides
 */
async function computeProtocolCompliance(client, food, protocolId, protocolName) {
    try {
        // Step 1: Check for admin override first (highest priority)
        const overrideQuery = `
            SELECT status, phase, notes, override_reason
            FROM protocol_food_overrides 
            WHERE protocol_id = $1 AND food_id = $2
        `;
        const overrideResult = await client.query(overrideQuery, [protocolId, food.id]);
        
        if (overrideResult.rows.length > 0) {
            const override = overrideResult.rows[0];
            return {
                protocol_name: protocolName,
                status: override.status,
                phase: override.phase,
                notes: override.notes,
                display_message: getProtocolDisplayMessage(override.status, protocolName, override.notes),
                icon: getProtocolIcon(override.status),
                rule_source: `Admin Override: ${override.override_reason}`
            };
        }
        
        // Step 2: Apply property-based rules (ordered by rule_order)
        const rulesQuery = `
            SELECT rule_type, property_name, property_values, category_names, subcategory_names, 
                   status, phase, notes, rule_order
            FROM protocol_rules 
            WHERE protocol_id = $1 AND is_active = true
            ORDER BY rule_order ASC
        `;
        const rulesResult = await client.query(rulesQuery, [protocolId]);
        
        for (const rule of rulesResult.rows) {
            const matches = checkRuleMatch(food, rule);
            if (matches) {
                return {
                    protocol_name: protocolName,
                    status: rule.status,
                    phase: rule.phase,
                    notes: rule.notes,
                    display_message: getProtocolDisplayMessage(rule.status, protocolName, rule.notes),
                    icon: getProtocolIcon(rule.status),
                    rule_source: `Rule: ${rule.rule_type}`
                };
            }
        }
        
        // Step 3: Default to unknown if no rules match
        return {
            protocol_name: protocolName,
            status: 'unknown',
            display_message: `🔍 Not yet evaluated for your ${protocolName} protocol`,
            icon: '🔍',
            rule_source: 'No matching rules found'
        };
        
    } catch (error) {
        console.error('Error computing protocol compliance:', error);
        return {
            protocol_name: protocolName,
            status: 'unknown',
            display_message: `🔍 Error checking ${protocolName} compliance`,
            icon: '🔍'
        };
    }
}

/**
 * Check if a food matches a specific protocol rule
 */
function checkRuleMatch(food, rule) {
    switch (rule.rule_type) {
        case 'avoid_property':
        case 'allow_property':
            if (!rule.property_name || !rule.property_values) return false;
            
            const foodPropertyValue = food[rule.property_name];
            if (foodPropertyValue === null || foodPropertyValue === undefined) return false;
            
            // Handle boolean properties (like nightshade)
            if (typeof foodPropertyValue === 'boolean') {
                return rule.property_values.includes(foodPropertyValue.toString());
            }
            
            // Handle string properties (like histamine levels)
            return rule.property_values.includes(foodPropertyValue);
            
        case 'avoid_category':
        case 'allow_category':
            if (!rule.category_names) return false;
            return rule.category_names.includes(food.category);
            
        case 'avoid_subcategory':
        case 'allow_subcategory':
            if (!rule.subcategory_names) return false;
            return rule.subcategory_names.includes(food.subcategory);
            
        default:
            return false;
    }
}

// Helper functions for display messages and icons
function getProtocolDisplayMessage(status, protocolName, notes) {
    const protocol = protocolName || 'your protocol';
    
    switch (status) {
        case 'allowed':
            return `💡 Generally recommended on your ${protocol}`;
        case 'avoid':
            return `🔍 Not typically included in your ${protocol}`;
        case 'moderation':
            return `⚠️ Consider limiting on your ${protocol}`;
        case 'conditional':
            return notes 
                ? `🔍 Your ${protocol} suggests: ${notes}`
                : `🔍 May be suitable for your ${protocol} under certain conditions`;
        case 'reintroduction':
            return `🔄 Available for reintroduction in your ${protocol}`;
        case 'unknown':
        default:
            return `🔍 Not yet evaluated for your ${protocol}`;
    }
}

function getProtocolIcon(status) {
    switch (status) {
        case 'allowed': return '💡';
        case 'avoid': return '🔍';
        case 'moderation': return '⚠️';
        case 'conditional': return '🔍';
        case 'reintroduction': return '🔄';
        case 'unknown':
        default: return '🔍';
    }
}

const handleGetProtocolFoods = async (queryParams, event) => {
    try {
        const protocol_id = queryParams.protocol_id || queryParams.dietary_protocol_id;
        
        if (!protocol_id) {
            return errorResponse('protocol_id parameter is required', 400);
        }
        
        const client = await pool.connect();
        
        // Get protocol info
        const protocolQuery = `SELECT name FROM protocols WHERE id = $1`;
        const protocolResult = await client.query(protocolQuery, [protocol_id]);
        
        if (protocolResult.rows.length === 0) {
            client.release();
            return errorResponse('Protocol not found', 404);
        }
        
        const protocolName = protocolResult.rows[0].name;
        
        // Get sample of foods and compute compliance for admin review
        const foodQuery = `
            SELECT 
                food_id as id, display_name as name, category_name as category,
                subcategory_name as subcategory, nightshade, histamine, oxalate,
                lectin, fodmap, salicylate
            FROM mat_food_search
            ORDER BY category_name ASC, display_name ASC
            LIMIT 100
        `;
        
        const foodResult = await client.query(foodQuery);
        
        const foodsByStatus = {
            allowed: [], moderation: [], conditional: [], 
            reintroduction: [], avoid: [], unknown: []
        };
        
        for (const food of foodResult.rows) {
            const compliance = await computeProtocolCompliance(
                client, food, protocol_id, protocolName
            );
            
            const foodWithCompliance = {
                ...food,
                protocol_status: compliance.status,
                display_message: compliance.display_message,
                icon: compliance.icon,
                rule_source: compliance.rule_source
            };
            
            const status = compliance.status || 'unknown';
            foodsByStatus[status].push(foodWithCompliance);
        }
        
        client.release();
        
        return successResponse({
            foods_by_status: foodsByStatus,
            compliance_stats: {
                total: foodResult.rows.length,
                allowed: foodsByStatus.allowed.length,
                avoid: foodsByStatus.avoid.length,
                moderation: foodsByStatus.moderation.length,
                unknown: foodsByStatus.unknown.length
            },
            protocol_id,
            protocol_name: protocolName
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
