// ============================================
// Database Connection Setup
// Creates and exports the MySQL connection pool
// ============================================

// Import MySQL package for database operations
const mysql = require('mysql2/promise');

// Create a pool of reusable database connections
// Pool settings come from the .env file
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',        // Where MySQL is running
  port: Number(process.env.DB_PORT) || 3306,       // MySQL port (default is 3306)
  user: process.env.DB_USER || 'root',             // MySQL username
  password: process.env.DB_PASSWORD || '',         // MySQL password
  database: process.env.DB_NAME || 'hargeisa_property_tax', // Database name
  waitForConnections: true,  // Wait if no connections available
  connectionLimit: 10,       // Allow up to 10 connections at once
  queueLimit: 0              // Unlimited requests waiting for connection
});

// Export the pool so other files can use it
module.exports = pool;
