const { pool } = require('../database/connection');
const { successResponse, errorResponse } = require('../utils/responses');
const { handleDatabaseError } = require('../utils/errors');

const handleSearchFoods = async (queryParams, event) => {
    try {
        const client = await pool.connect();
        const { search = '', protocol_id = null } = queryParams;
        
        let query = `
            SELECT 
                fp.id,
                fp.name,
                fp.category,
                fp.nightshade,
                fp.histamine,
                fp.oxalate,
                fp.lectin
        `;
        
        if (protocol_id) {
            query += `,
                p.protocol_type,
                p.category as protocol_category,
                COALESCE(pfr.status, 'unknown') as protocol_status,
                pfr.phase as protocol_phase,
                pfr.notes as protocol_notes,
                CASE 
                    WHEN p.protocol_type = 'property_based' THEN
                        CASE p.category
                            WHEN 'low_histamine' THEN 
                                CASE WHEN fp.histamine = 'low' THEN 'allowed' ELSE 'avoid' END
                            WHEN 'low_oxalate' THEN
                                CASE WHEN fp.oxalate = 'low' THEN 'allowed' ELSE 'avoid' END
                            WHEN 'low_lectin' THEN
                                CASE WHEN fp.lectin = 'low' THEN 'allowed' ELSE 'avoid' END
                            ELSE COALESCE(pfr.status, 'unknown')
                        END
                    ELSE COALESCE(pfr.status, 'unknown')
                END as computed_status
            FROM food_properties fp
            JOIN protocols p ON p.id = $2
            LEFT JOIN protocol_food_rules pfr ON fp.id = pfr.food_id AND pfr.protocol_id = $2
            WHERE fp.name ILIKE $1
            ORDER BY 
                CASE 
                    WHEN p.protocol_type = 'property_based' THEN
                        CASE p.category
                            WHEN 'low_histamine' THEN 
                                CASE WHEN fp.histamine = 'low' THEN 1 ELSE 4 END
                            WHEN 'low_oxalate' THEN
                                CASE WHEN fp.oxalate = 'low' THEN 1 ELSE 4 END
                            WHEN 'low_lectin' THEN
                                CASE WHEN fp.lectin = 'low' THEN 1 ELSE 4 END
                            ELSE 
                                CASE pfr.status 
                                    WHEN 'allowed' THEN 1
                                    WHEN 'conditional' THEN 2  
                                    WHEN 'reintroduction' THEN 3
                                    WHEN 'avoid' THEN 4
                                    ELSE 5
                                END
                        END
                    ELSE
                        CASE pfr.status 
                            WHEN 'allowed' THEN 1
                            WHEN 'conditional' THEN 2  
                            WHEN 'reintroduction' THEN 3
                            WHEN 'avoid' THEN 4
                            ELSE 5
                        END
                END,
                fp.name ASC
            LIMIT 50
            `;
        } else {
            query += `
            FROM food_properties fp
            WHERE fp.name ILIKE $1
            ORDER BY fp.name ASC
            LIMIT 50
            `;
        }
        
        const values = protocol_id ? [`%${search}%`, protocol_id] : [`%${search}%`];
        const result = await client.query(query, values);
        client.release();
        
        // If protocol_id provided, use computed_status as the protocol_status
        const foods = result.rows.map(row => {
            if (protocol_id && row.computed_status) {
                return {
                    ...row,
                    protocol_status: row.computed_status
                };
            }
            return row;
        });
        
        return successResponse({
            foods: foods,
            total: foods.length,
            search_term: search,
            protocol_id: protocol_id
        });
        
    } catch (error) {
        const appError = handleDatabaseError(error, 'search foods');
        return errorResponse(appError.message, appError.statusCode);
    }
};

module.exports = {
    handleSearchFoods
};