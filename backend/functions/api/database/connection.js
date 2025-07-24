const { Pool } = require('pg');

// Secure database connection configuration
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: true,
        // In production, you'd add the RDS CA certificate here
        // ca: fs.readFileSync('rds-ca-2019-root.pem')
    } : {
        // Development: More lenient SSL for easier setup
        rejectUnauthorized: false
    },
    // Connection pool settings optimized for Lambda with longer timeouts
    max: 1, // Single connection per Lambda instance
    min: 0, // No minimum connections
    idleTimeoutMillis: 30000, // Keep connections alive longer
    connectionTimeoutMillis: 15000, // Longer connection timeout
    acquireTimeoutMillis: 15000, // Longer timeout for acquiring connections
    statement_timeout: 30000, // 30 second query timeout
    query_timeout: 30000, // 30 second query timeout
});

// Handle connection errors gracefully
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    // Don't exit process in Lambda - just log the error
    console.error('Pool error occurred, continuing...');
});

// Handle connection events for debugging
pool.on('connect', (client) => {
    console.log('Database client connected');
});

pool.on('acquire', (client) => {
    console.log('Database client acquired from pool');
});

pool.on('remove', (client) => {
    console.log('Database client removed from pool');
});

// Graceful shutdown function for Lambda
const closePool = async () => {
    try {
        await pool.end();
        console.log('Database pool closed successfully');
    } catch (err) {
        console.error('Error closing database pool:', err);
    }
};

// Export both pool and cleanup function
module.exports = { pool, closePool };
