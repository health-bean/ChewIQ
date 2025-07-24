// refresh_views.js - Simple script to refresh materialized views
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});

async function refreshViews() {
    const client = await pool.connect();
    try {
        console.log('Refreshing materialized views...');
        
        // Refresh mat_food_search
        console.log('Refreshing mat_food_search...');
        await client.query('REFRESH MATERIALIZED VIEW mat_food_search');
        
        const foodCount = await client.query('SELECT COUNT(*) FROM mat_food_search');
        console.log(`mat_food_search now has ${foodCount.rows[0].count} rows`);
        
        // Test chicken search
        const chickenTest = await client.query(`
            SELECT COUNT(*) FROM mat_food_search 
            WHERE display_name ILIKE '%chicken%'
        `);
        console.log(`Found ${chickenTest.rows[0].count} chicken entries`);
        
        // Refresh mat_protocol_foods
        console.log('Refreshing mat_protocol_foods...');
        await client.query('REFRESH MATERIALIZED VIEW mat_protocol_foods');
        
        const protocolFoodCount = await client.query('SELECT COUNT(*) FROM mat_protocol_foods');
        console.log(`mat_protocol_foods now has ${protocolFoodCount.rows[0].count} rows`);
        
        console.log('✅ Materialized views refreshed successfully');
        
    } catch (err) {
        console.error('❌ Error refreshing views:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

refreshViews().catch(console.error);
