// Quick test to debug the correlations endpoint issue
const { pool } = require('./backend/functions/api/database/connection');

async function testCorrelationsDebug() {
  const client = await pool.connect();
  
  try {
    console.log('Testing correlations endpoint debug...');
    
    // Test 1: Check if sarah-aip user exists
    const userCheck = await client.query(
      'SELECT user_id, username FROM users WHERE user_id = $1',
      ['8e8a568a-c2f8-43a8-abf2-4e54408dbdc0']
    );
    console.log('User check result:', userCheck.rows);
    
    // Test 2: Check timeline data for this user
    const timelineCheck = await client.query(
      `SELECT COUNT(*) as count, entry_type, 
       MIN(entry_date) as earliest, MAX(entry_date) as latest
       FROM timeline_entries 
       WHERE user_id = $1 
       GROUP BY entry_type`,
      ['8e8a568a-c2f8-43a8-abf2-4e54408dbdc0']
    );
    console.log('Timeline data for sarah-aip:', timelineCheck.rows);
    
    // Test 3: Check recent timeline entries
    const recentEntries = await client.query(
      `SELECT entry_date, entry_type, structured_content
       FROM timeline_entries 
       WHERE user_id = $1 
       ORDER BY entry_date DESC, entry_time DESC
       LIMIT 5`,
      ['8e8a568a-c2f8-43a8-abf2-4e54408dbdc0']
    );
    console.log('Recent entries:', recentEntries.rows);
    
  } catch (error) {
    console.error('Debug test failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testCorrelationsDebug().catch(console.error);