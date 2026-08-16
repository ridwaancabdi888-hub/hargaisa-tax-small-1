// ============================================
// Authentication Routes
// Handles administrator login and authentication
// ============================================

// Import required packages
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/database');

const router = express.Router();

// Hash used only by the hosted demo account.
const DEMO_PASSWORD_HASH = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';

// POST /api/login
// Check if the username and password are correct.
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.'
    });
  }

  // Vercel cannot connect to the XAMPP database on the laptop,
  // so the hosted version includes one simple demo account.
  if (process.env.VERCEL || process.env.DEMO_MODE === 'true') {
    const enteredHash = crypto.createHash('sha256').update(password).digest('hex');

    if (username === 'ridwan' && enteredHash === DEMO_PASSWORD_HASH) {
      return res.json({
        success: true,
        message: 'Demo login successful.',
        user: { id: 1, username: 'ridwan' }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid username or password.'
    });
  }

  try {
    // Search the users table for the username.
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

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
