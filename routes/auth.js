// ============================================
// Authentication Routes
// Handles administrator login and authentication
// ============================================

// Import required packages
const express = require('express');         // Create API endpoints
const bcrypt = require('bcryptjs');        // Check passwords securely
const db = require('../config/database');  // Connect to MySQL

const router = express.Router();

// POST /api/login
// Check if the username and password are correct
// Return user info if login is successful
router.post('/login', async (req, res) => {
  // Get username and password from the request body
  const { username, password } = req.body;

  // Validate that both username and password were provided
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.'
    });
  }

  try {
    // Search the users table for the username
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

    // If username not found
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    // Get the user from the database
    const user = rows[0];
    
    // Compare the provided password with the hashed password stored in database
    const passwordMatches = await bcrypt.compare(password, user.password);

    // If password does not match
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    // Login successful - return user info to frontend
    return res.json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while logging in.'
    });
  }
});

module.exports = router;
