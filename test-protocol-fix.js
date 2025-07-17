#!/usr/bin/env node

/**
 * Script to assign a protocol to Mike
 */

// Load environment variables from .env file
require('dotenv').config({ path: './backend/.env' });

// Set NODE_ENV to development if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const { pool } = require('./backend/functions/api/database/connection');

async function assignProtocolToMike() {
  console.log('🔍 Assigning FODMAP protocol to Mike...');
  
  const client = await pool.connect();
  
  try {
    // First, check the valid user_type_enum values
    const enumQuery = `
      SELECT enum_range(NULL::user_type_enum) as enum_values
    `;
    
    const enumResult = await client.query(enumQuery);
    console.log('Valid user_type_enum values:', enumResult.rows[0].enum_values);
    
    // Find Mike by email
    const mikeEmail = 'mike.fodmap@test.com';
    
    // Check if Mike exists
    const checkUserQuery = `
      SELECT id FROM users WHERE email = $1
    `;
    
    const userResult = await client.query(checkUserQuery, [mikeEmail]);
    
    let mikeId;
    
    if (userResult.rows.length === 0) {
      console.log('Mike does not exist in the database, creating user...');
      
      // Create Mike in the database
      const createUserQuery = `
        INSERT INTO users (
          email, first_name, last_name, user_type, is_active, role
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        ) RETURNING id
      `;
      
      const newUserResult = await client.query(createUserQuery, [
        mikeEmail,
        'Mike',
        'Chen',
        'patient', // Use 'patient' instead of 'demo'
        true,
        'patient'
      ]);
      
      mikeId = newUserResult.rows[0].id;
      console.log(`Created Mike in the database with ID: ${mikeId}`);
    } else {
      mikeId = userResult.rows[0].id;
      console.log(`Mike already exists in the database with ID: ${mikeId}`);
    }
    // First, check if a FODMAP protocol exists
    const checkProtocolQuery = `
      SELECT id, name FROM protocols 
      WHERE category = 'low_fodmap' OR name ILIKE '%fodmap%'
    `;
    
    const protocolResult = await client.query(checkProtocolQuery);
    
    let protocolId;
    
    if (protocolResult.rows.length > 0) {
      // Use existing FODMAP protocol
      protocolId = protocolResult.rows[0].id;
      console.log(`Found existing FODMAP protocol: ${protocolResult.rows[0].name} (${protocolId})`);
    } else {
      // Create a new FODMAP protocol
      console.log('No FODMAP protocol found, creating one...');
      
      const createProtocolQuery = `
        INSERT INTO protocols (
          name, description, category, phases, is_global, official, protocol_type
        ) VALUES (
          'Low FODMAP', 
          'Protocol for managing IBS and digestive issues by eliminating fermentable carbohydrates',
          'low_fodmap',
          '{"phases": [
            {
              "phase": 1,
              "name": "Elimination",
              "description": "Remove all high FODMAP foods",
              "duration_days": 28
            },
            {
              "phase": 2,
              "name": "Reintroduction",
              "description": "Systematically test FODMAP groups",
              "duration_days": 56
            },
            {
              "phase": 3,
              "name": "Personalization",
              "description": "Create personalized diet based on triggers",
              "duration_days": 0
            }
          ]}'::jsonb,
          true,
          true,
          'rule_based'
        ) RETURNING id
      `;
      
      const newProtocolResult = await client.query(createProtocolQuery);
      protocolId = newProtocolResult.rows[0].id;
      console.log(`Created new FODMAP protocol with ID: ${protocolId}`);
    }
    
    // Now assign the protocol to Mike
    
    // Check if Mike already has this protocol
    const checkUserProtocolQuery = `
      SELECT id FROM user_protocols
      WHERE user_id = $1 AND protocol_id = $2
    `;
    
    const userProtocolResult = await client.query(checkUserProtocolQuery, [mikeId, protocolId]);
    
    if (userProtocolResult.rows.length > 0) {
      // Update existing protocol assignment
      console.log('Mike already has this protocol assigned, updating it...');
      
      const updateQuery = `
        UPDATE user_protocols
        SET active = true,
            protocol_data = jsonb_build_object(
              'active', true,
              'current_phase', 1,
              'compliance_score', 85,
              'start_date', CURRENT_DATE::text,
              'phase_history', jsonb_build_array(
                jsonb_build_object(
                  'phase', 1,
                  'started', CURRENT_DATE::text,
                  'status', 'active'
                )
              )
            )
        WHERE id = $1
        RETURNING id
      `;
      
      const updateResult = await client.query(updateQuery, [userProtocolResult.rows[0].id]);
      console.log(`Updated protocol assignment with ID: ${updateResult.rows[0].id}`);
    } else {
      // Create new protocol assignment
      const assignProtocolQuery = `
        INSERT INTO user_protocols (
          user_id, protocol_id, start_date, active, protocol_data
        ) VALUES (
          $1, $2, CURRENT_DATE, true,
          jsonb_build_object(
            'active', true,
            'current_phase', 1,
            'compliance_score', 85,
            'start_date', CURRENT_DATE::text,
            'phase_history', jsonb_build_array(
              jsonb_build_object(
                'phase', 1,
                'started', CURRENT_DATE::text,
                'status', 'active'
              )
            )
          )
        ) RETURNING id
      `;
      
      const assignResult = await client.query(assignProtocolQuery, [mikeId, protocolId]);
      console.log(`Assigned protocol to Mike with assignment ID: ${assignResult.rows[0].id}`);
    }
    
    // Verify the assignment
    const verifyQuery = `
      SELECT 
        up.id as assignment_id,
        p.name as protocol_name,
        (up.protocol_data->>'current_phase')::INTEGER as current_phase,
        up.start_date,
        up.active,
        up.protocol_data
      FROM user_protocols up
      JOIN protocols p ON up.protocol_id = p.id
      WHERE up.user_id = $1 AND up.active = true
    `;
    
    const verifyResult = await client.query(verifyQuery, [mikeId]);
    
    if (verifyResult.rows.length > 0) {
      console.log('✅ Protocol successfully assigned to Mike:');
      console.log(JSON.stringify(verifyResult.rows[0], null, 2));
    } else {
      console.log('❌ Failed to verify protocol assignment');
    }
    
  } catch (error) {
    console.error('❌ Error assigning protocol:', error);
    console.error('Error stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the function
assignProtocolToMike().catch(console.error);