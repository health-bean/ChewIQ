#!/usr/bin/env node

/**
 * Script to test user preferences API
 */

// Load environment variables from .env file
require('dotenv').config({ path: './backend/.env' });

// Set NODE_ENV to development if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const { pool } = require('./backend/functions/api/database/connection');
const { getCurrentUser } = require('./backend/functions/api/middleware/auth');
const { handleGetUserPreferences } = require('./backend/functions/api/handlers/users');

async function testUserPreferences() {
  console.log('🔍 Testing user preferences API...');
  
  // Test for Lisa specifically
  const demoUserId = 'lisa-histamine';
  
  console.log(`\n🔍 Testing preferences for ${demoUserId}...`);
  
  // Create a mock event with demo headers
  const mockEvent = {
    headers: {
      'x-demo-mode': 'true',
      'x-demo-user-id': demoUserId,
      'x-demo-session-id': 'test_session_123'
    }
  };
  
  try {
    console.log('Step 1: Testing auth middleware...');
    const user = await getCurrentUser(mockEvent);
    
    if (!user) {
      console.error(`❌ Authentication failed for ${demoUserId} - no user returned`);
      return;
    }
    
    console.log(`✅ Authentication successful for ${demoUserId}!`);
    console.log('User ID:', user.id);
    
    // Add user to event like the main handler does
    mockEvent.user = user;
    
    console.log('Step 2: Checking database preferences directly...');
    const client = await pool.connect();
    
    try {
      const dbQuery = `
        SELECT preferences FROM user_preferences WHERE user_id = $1
      `;
      
      const dbResult = await client.query(dbQuery, [user.id]);
      
      if (dbResult.rows.length > 0) {
        console.log(`✅ Found preferences in database for ${demoUserId}`);
        console.log('Database preferences:', JSON.stringify(dbResult.rows[0].preferences, null, 2));
        console.log(`setup_complete value: ${dbResult.rows[0].preferences.setup_complete}`);
        console.log(`Type of setup_complete: ${typeof dbResult.rows[0].preferences.setup_complete}`);
        
        // Update setup_complete to true if it's not already
        if (dbResult.rows[0].preferences.setup_complete !== true) {
          console.log('Updating setup_complete to true...');
          
          const updatedPreferences = {
            ...dbResult.rows[0].preferences,
            setup_complete: true
          };
          
          const updateQuery = `
            UPDATE user_preferences
            SET preferences = $1
            WHERE user_id = $2
          `;
          
          await client.query(updateQuery, [JSON.stringify(updatedPreferences), user.id]);
          console.log('✅ Updated setup_complete to true');
          
          // Verify the update
          const verifyResult = await client.query(dbQuery, [user.id]);
          console.log('Updated preferences:', JSON.stringify(verifyResult.rows[0].preferences, null, 2));
          console.log(`New setup_complete value: ${verifyResult.rows[0].preferences.setup_complete}`);
          console.log(`New type of setup_complete: ${typeof verifyResult.rows[0].preferences.setup_complete}`);
        }
      } else {
        console.log(`❌ No preferences found in database for ${demoUserId}`);
      }
    } finally {
      client.release();
    }
    
    console.log('Step 3: Calling handleGetUserPreferences...');
    const response = await handleGetUserPreferences({}, mockEvent);
    
    console.log(`✅ API response status: ${response.statusCode}`);
    const responseBody = JSON.parse(response.body);
    console.log('API preferences:', JSON.stringify(responseBody.preferences, null, 2));
    console.log(`API setup_complete value: ${responseBody.preferences.setup_complete}`);
    console.log(`Type of API setup_complete: ${typeof responseBody.preferences.setup_complete}`);
    
    // Test the boolean comparison
    console.log('\nTesting boolean comparison:');
    console.log(`responseBody.preferences.setup_complete !== true: ${responseBody.preferences.setup_complete !== true}`);
    console.log(`responseBody.preferences.setup_complete === true: ${responseBody.preferences.setup_complete === true}`);
    
  } catch (error) {
    console.error(`❌ Error testing ${demoUserId}:`, error);
    console.error('Error stack:', error.stack);
  } finally {
    // Close the database connection
    await pool.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the function
testUserPreferences().catch(console.error);