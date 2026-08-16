// ============================================
// Dashboard and Reports Routes
// API endpoints that return statistics and data summaries
// ============================================

// Import required packages
const express = require('express');        // Create API endpoints
const db = require('../config/database');  // Connect to MySQL

const router = express.Router();

// GET /api/dashboard
// Return dashboard statistics: total properties, paid/unpaid count, tax collected
router.get('/dashboard', async (req, res) => {
  try {
    // Run a single SQL query to calculate all dashboard statistics at once
    // COUNT(*) = total number of properties
    // SUM(CASE...) = count properties where tax_status = 'Paid'
    // SUM(CASE...) = count properties where tax_status = 'Unpaid'
    // SUM(tax_amount WHERE Paid) = total tax money collected
    const [stats] = await db.execute(`
      SELECT
        COUNT(*) AS total_properties,
        SUM(CASE WHEN tax_status = 'Paid' THEN 1 ELSE 0 END) AS paid_properties,
        SUM(CASE WHEN tax_status = 'Unpaid' THEN 1 ELSE 0 END) AS unpaid_properties,
        SUM(CASE WHEN tax_status = 'Paid' THEN tax_amount ELSE 0 END) AS total_tax_collected
      FROM properties
    `);

    const result = stats[0];

    // Return statistics in a readable format
    return res.json({
      totalProperties: Number(result.total_properties || 0),
      paidProperties: Number(result.paid_properties || 0),
      unpaidProperties: Number(result.unpaid_properties || 0),
      totalTaxCollected: Number(result.total_tax_collected || 0)
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ message: 'Unable to load dashboard data.' });
  }
});

// GET /api/reports
// Return detailed reports with statistics AND complete list of properties
router.get('/reports', async (req, res) => {
  try {
    // Get the same statistics as dashboard
    const [stats] = await db.execute(`
      SELECT
        COUNT(*) AS total_properties,
        SUM(CASE WHEN tax_status = 'Paid' THEN 1 ELSE 0 END) AS paid_properties,
        SUM(CASE WHEN tax_status = 'Unpaid' THEN 1 ELSE 0 END) AS unpaid_properties,
        SUM(CASE WHEN tax_status = 'Paid' THEN tax_amount ELSE 0 END) AS total_tax_collected
      FROM properties
    `);

    // Also get the full list of all properties (newest first)
    const [properties] = await db.execute(`
      SELECT *
      FROM properties
      ORDER BY created_at DESC
    `);

    // Return both statistics and property list
    return res.json({
      stats: {
        totalProperties: Number(stats[0].total_properties || 0),
        paidProperties: Number(stats[0].paid_properties || 0),
        unpaidProperties: Number(stats[0].unpaid_properties || 0),
        totalTaxCollected: Number(stats[0].total_tax_collected || 0)
      },
      properties
    });
  } catch (error) {
    console.error('Reports error:', error);
    return res.status(500).json({ message: 'Unable to load reports data.' });
  }
});

module.exports = router;
