// ============================================
// Hargeisa Property Tax Management System
// Main backend server file
// ============================================

// 1. LOAD ENVIRONMENT VARIABLES
// This reads the .env file to get database settings
require('dotenv').config();

// 2. IMPORT REQUIRED PACKAGES
const express = require('express');  // Backend web framework
const path = require('path');         // Work with file paths
const cors = require('cors');         // Allow frontend to call the API
const db = require('./config/database'); // Database connection

// Import API route files
const authRoutes = require('./routes/auth');          // Login routes
const dashboardRoutes = require('./routes/dashboard'); // Dashboard data
const propertyRoutes = require('./routes/properties'); // Property CRUD
const taxRoutes = require('./routes/taxes');          // Tax payments

// 3. CREATE THE EXPRESS APPLICATION
const app = express();
const PORT = process.env.PORT || 3000; // Use .env PORT or default to 3000

// 4. ENABLE REQUEST FEATURES
// Allow frontend to call the API from the same server
app.use(cors());

// Parse JSON and form data from requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. SERVE FRONTEND FILES
// Serve HTML, CSS, JS, and images from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// 6. REGISTER API ROUTES
// All API endpoints start with /api
app.use('/api', authRoutes);      // /api/login
app.use('/api', dashboardRoutes); // /api/dashboard
app.use('/api', propertyRoutes);  // /api/properties
app.use('/api', taxRoutes);       // /api/taxes

// 7. HOME PAGE ROUTE
// When user visits http://localhost:3000, show the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 8. START THE SERVER
// Test database connection first, then start listening for requests
async function startServer() {
  try {
    // Test connection to MySQL database
    const connection = await db.getConnection();
    console.log('MySQL connected successfully.');
    connection.release(); // Return connection to pool

    // Start the Node.js server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

// Run the startup function
startServer();
