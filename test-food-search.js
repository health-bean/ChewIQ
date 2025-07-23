require('dotenv').config({ path: 'backend/.env' });
const { pool } = require('./backend/functions/api/database/connection');

async function testFoodSearch() {
    console.log('=== TESTING FOOD SEARCH PERFORMANCE ===\n');
    
    let client;
    try {
        client = await pool.connect();
        console.log('✅ Database connection successful');
        
        const searchTerm = 'chicken';
        const protocolId = 'a80be547-6db1-4722-a5a4-60930143a2d9';
        const searchPattern = `%${searchTerm}%`;
        
        // Test the new materialized view query
        const query = `
            SELECT 
                mfs.simplified_food_id as id,
                mfs.display_name as name,
                mfs.category_name as category,
                mfs.subcategory_name,
                mfs.preparation_state,
                mfs.is_organic,
                COALESCE(pfr.status, 'unknown') as protocol_status
            FROM mat_food_search mfs
            LEFT JOIN protocol_food_rules pfr ON mfs.simplified_food_id = pfr.food_id AND pfr.protocol_id = $2
            WHERE mfs.display_name ILIKE $1
            ORDER BY mfs.display_name ASC
            LIMIT 10
        `;
        
        console.log('🔍 Testing search for:', searchTerm);
        console.log('🔍 Protocol ID:', protocolId);
        
        const startTime = Date.now();
        const result = await client.query(query, [searchPattern, protocolId]);
        const endTime = Date.now();
        
        console.log('✅ Query completed in:', endTime - startTime, 'ms');
        console.log('📊 Results:', result.rows.length, 'foods found');
        
        result.rows.forEach(row => {
            console.log(`  - ${row.name} (${row.category}) - ${row.protocol_status}`);
        });
        
        // Test a simpler query for comparison
        console.log('\n=== TESTING SIMPLER QUERY ===');
        const simpleQuery = `
            SELECT id, display_name as name
            FROM simplified_foods 
            WHERE display_name ILIKE $1
            ORDER BY display_name ASC
            LIMIT 10
        `;
        
        const startTime2 = Date.now();
        const result2 = await client.query(simpleQuery, [searchPattern]);
        const endTime2 = Date.now();
        
        console.log('✅ Simple query completed in:', endTime2 - startTime2, 'ms');
        console.log('📊 Results:', result2.rows.length, 'foods found');
        
    } catch (error) {
        console.error('❌ Error testing food search:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
    }
}

testFoodSearch();