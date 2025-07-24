// check_columns.js - Simple script to check column names
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

async function checkColumns() {
    const client = await pool.connect();
    try {
        console.log('Checking mat_food_search columns:');
        const result = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'mat_food_search'
            ORDER BY ordinal_position
        `);
        
        result.rows.forEach(row => {
            console.log(`  ${row.column_name} (${row.data_type})`);
        });
        
        // Test a simple query to see what works
        console.log('\nTesting simple query:');
        const testResult = await client.query('SELECT * FROM mat_food_search LIMIT 1');
        if (testResult.rows.length > 0) {
            console.log('Available columns from actual query:');
            Object.keys(testResult.rows[0]).forEach(key => {
                console.log(`  ${key}`);
            });
        }
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

checkColumns().catch(console.error);
