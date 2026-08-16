// Script to create a new user account
const db = require('./config/database');
const bcryptjs = require('bcryptjs');

async function createUser(username, password) {
  try {
    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);
    
    // Get a connection from the pool
    const connection = await db.getConnection();
    
    try {
      // Insert the new user
      const result = await connection.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword]
      );
      
      console.log(`✓ User account created successfully`);
      console.log(`  Username: ${username}`);
      console.log(`  Password: ${password}`);
      console.log(`  User ID: ${result.insertId}`);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('✗ Error creating user:', error.message);
    process.exit(1);
  }
}

// Create the user
createUser('ridwan', '123');
