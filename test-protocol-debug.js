#!/usr/bin/env node

/**
 * Test script to debug protocol loading issues
 */

// Load environment variables from .env file
require('dotenv').config({ path: './backend/.env' });

// Set NODE_ENV to development if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const { pool } = require('./backend/functions/api/database/connection');
const { getCurrentUser } = require('./backend/functions/api/middleware/auth');
const { handleGetUserProtocols, handleGetCurrentProtocol } = require('./backend/functions/api/handlers/users');

async function testProtocolsForMike() {
  console.log('🔍 Testing protocol loading for Mike...');
  
  // Create a mock event with Mike's demo headers
  const mockEvent = {
    headers: {
      'x-demo-mode': 'true',
      'x-demo-user-id': 'mike-fodmap',
      'x-demo-session-id': 'test_session_123'
    }
  };
  
  try {
    console.log('Step 1: Testing auth middleware...');
    const user = await getCurrentUser(mockEvent);
    
    if (!user) {
      console.error('❌ Authentication failed - no user returned');
      return;
    }
    
    console.log('✅ Authentication successful!');
    console.log('User:', JSON.stringify(user, null, 2));
    
    // Add user to event like the main handler does
    mockEvent.user = user;
    
    console.log('Step 2: Checking user_protocols table...');
    const client = await pool.connect();
    
    try {
      // Check if Mike has any protocols assigned
      const protocolQuery = `
        SELECT * FROM user_protocols 
        WHERE user_id = $1
      `;
      
      const protocolResult = await client.query(protocolQuery, [user.id]);
      console.log(`Found ${protocolResult.rows.length} protocols for Mike`);
      
      if (protocolResult.rows.length > 0) {
        console.log('Protocol details:', JSON.stringify(protocolResult.rows, null, 2));
      } else {
        console.log('No protocols found for Mike');
      }
      
      // Check if the protocols table has entries
      const allProtocolsQuery = `
        SELECT id, name, category FROM protocols LIMIT 5
      `;
      
      const allProtocolsResult = await client.query(allProtocolsQuery);
      console.log(`Found ${allProtocolsResult.rows.length} protocols in the database`);
      
      if (allProtocolsResult.rows.length > 0) {
        console.log('Available protocols:', JSON.stringify(allProtocolsResult.rows, null, 2));
      } else {
        console.log('No protocols found in the database');
      }
      
      // Check if the get_user_current_protocol function exists
      const functionQuery = `
        SELECT routine_name, routine_type
        FROM information_schema.routines
        WHERE routine_name = 'get_user_current_protocol'
      `;
      
      const functionResult = await client.query(functionQuery);
      console.log(`Found ${functionResult.rows.length} functions named get_user_current_protocol`);
      
      if (functionResult.rows.length > 0) {
        console.log('Function details:', JSON.stringify(functionResult.rows, null, 2));
      } else {
        console.log('Function get_user_current_protocol not found');
      }
      
    } finally {
      client.release();
    }
    
    console.log('Step 3: Calling handleGetUserProtocols...');
    const protocolsResponse = await handleGetUserProtocols({}, mockEvent);
    
    console.log('Protocols response status:', protocolsResponse.statusCode);
    console.log('Protocols response body:', JSON.stringify(JSON.parse(protocolsResponse.body), null, 2));
    
    console.log('Step 4: Calling handleGetCurrentProtocol...');
    const currentProtocolResponse = await handleGetCurrentProtocol({}, mockEvent);
    
    console.log('Current protocol response status:', currentProtocolResponse.statusCode);
    console.log('Current protocol response body:', JSON.stringify(JSON.parse(currentProtocolResponse.body), null, 2));
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    console.error('Error stack:', error.stack);
  } finally {
    // Close the database connection
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the test
testProtocolsForMike().catch(console.error);