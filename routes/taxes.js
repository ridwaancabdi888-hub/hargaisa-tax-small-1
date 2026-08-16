// ============================================
// Tax Management Routes
// API endpoints for viewing tax records and recording tax payments
// ============================================

// Import required packages
const express = require('express');        // Create API endpoints
const db = require('../config/database');  // Connect to MySQL

const router = express.Router();

// GET /api/taxes
// Return all tax payment records linked to properties
router.get('/taxes', async (req, res) => {
  try {
    // Select property info and any payment records
    // LEFT JOIN includes properties even if no payment exists yet
    const [rows] = await db.execute(`
      SELECT
        p.id,
        p.property_code,
        p.owner_name,
        p.tax_amount,
        p.tax_status,
        tp.amount AS payment_amount,
        tp.payment_date
      FROM properties p
      LEFT JOIN tax_payments tp ON tp.property_id = p.id
      ORDER BY p.created_at DESC
    `);

    return res.json(rows);
  } catch (error) {
    console.error('Get taxes error:', error);
    return res.status(500).json({ message: 'Unable to load tax records.' });
  }
});

// POST /api/taxes/pay
// Record a tax payment for a property and update the property status to "Paid"
router.post('/taxes/pay', async (req, res) => {
  // Get payment information from the request body
  const { property_id, amount, payment_date } = req.body;

  // Check that all required information is provided
  if (!property_id || !amount || !payment_date) {
    return res.status(400).json({ message: 'Property ID, amount and date are required.' });
  }

  try {
    // Check if the property exists
    const [propertyRows] = await db.execute('SELECT * FROM properties WHERE id = ?', [property_id]);

    if (propertyRows.length === 0) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    // Insert a new payment record into the tax_payments table
    await db.execute(
      'INSERT INTO tax_payments (property_id, amount, payment_date, status) VALUES (?, ?, ?, ?)',
      [property_id, amount, payment_date, 'Paid']
    );

    // Update the property status to "Paid"
    await db.execute(
      'UPDATE properties SET tax_status = ?, tax_amount = ? WHERE id = ?',
      ['Paid', propertyRows[0].tax_amount, property_id]
    );

    return res.json({
      success: true,
      message: 'Payment recorded successfully.'
    });
  } catch (error) {
    console.error('Tax payment error:', error);
    return res.status(500).json({ message: 'Unable to record payment.' });
  }
});

module.exports = router;
