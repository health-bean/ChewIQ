// Minimal test to isolate the correlations 500 error
const { pool } = require('./backend/functions/api/database/connection');

async function testCorrelationsMinimal() {
  const client = await pool.connect();
  
  try {
    console.log('Testing minimal correlations flow...');
    
    const userId = '8e8a568a-c2f8-43a8-abf2-4e54408dbdc0'; // sarah-aip
    const timeframeDays = 180;
    
    // Test the exact query from correlations handler
    const query = `
      SELECT 
        entry_date,
        entry_time,
        entry_type,
        structured_content,
        severity,
        protocol_compliant,
        notes,
        created_at
      FROM timeline_entries 
      WHERE user_id = $1 
        AND entry_date >= CURRENT_DATE - INTERVAL '${timeframeDays} days'
      ORDER BY entry_date, entry_time
    `;

    console.log('Running timeline query...');
    const result = await client.query(query, [userId]);
    console.log(`Found ${result.rows.length} timeline entries`);
    
    if (result.rows.length > 0) {
      console.log('Sample entry:', {
        entry_type: result.rows[0].entry_type,
        structured_content: result.rows[0].structured_content,
        entry_date: result.rows[0].entry_date
      });
      
      // Test the structured_content parsing
      const firstEntry = result.rows[0];
      if (firstEntry.structured_content) {
        try {
          const structured = typeof firstEntry.structured_content === 'string' 
            ? JSON.parse(firstEntry.structured_content) 
            : firstEntry.structured_content;
          console.log('Parsed structured content:', structured);
        } catch (parseError) {
          console.error('Error parsing structured_content:', parseError);
        }
      }
    }
    
  } catch (error) {
    console.error('Minimal test failed:', error);
    console.error('Error stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

testCorrelationsMinimal().catch(console.error);