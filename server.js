// ============================================
// Hargeisa Property Tax Management System
// Main backend server file
// ============================================

// 1. LOAD ENVIRONMENT VARIABLES
require('dotenv').config();

// 2. IMPORT REQUIRED PACKAGES
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./config/database');

// Import API route files
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const propertyRoutes = require('./routes/properties');
const taxRoutes = require('./routes/taxes');

// 3. CREATE THE EXPRESS APPLICATION
const app = express();
const PORT = process.env.PORT || 3000;

// 4. ENABLE REQUEST FEATURES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. SERVE FRONTEND FILES
app.use(express.static(path.join(__dirname, 'public')));

// 6. REGISTER API ROUTES
app.use('/api', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', propertyRoutes);
app.use('/api', taxRoutes);

// 7. HOME PAGE ROUTE
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 8. LOCAL SERVER STARTUP
// Local development checks XAMPP/MySQL before starting.
async function startLocalServer() {
  try {
    const connection = await db.getConnection();
    console.log('MySQL connected successfully.');
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

// Vercel imports the Express app as a serverless function.
// On the laptop, start the normal Node.js server with XAMPP/MySQL.
if (!process.env.VERCEL) {
  startLocalServer();
}

module.exports = app;
