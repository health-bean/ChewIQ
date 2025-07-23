// Lambda function to refresh the materialized view
const { Client } = require('pg');

// Database connection configuration
// In production, store these in AWS Secrets Manager or Parameter Store
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false // Needed for RDS SSL connections
  }
};

exports.handler = async (event) => {
  console.log('Starting materialized view refresh');
  
  let client;
  try {
    // Connect to the database
    client = new Client(dbConfig);
    await client.connect();
    console.log('Connected to database');
    
    // Refresh the materialized view
    console.log('Refreshing materialized view: mat_food_search');
    await client.query('REFRESH MATERIALIZED VIEW mat_food_search');
    console.log('Materialized view refreshed successfully');
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Materialized view refreshed successfully',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error refreshing materialized view:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error refreshing materialized view',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  } finally {
    // Close the database connection
    if (client) {
      await client.end();
      console.log('Database connection closed');
    }
  }
};
