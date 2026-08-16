// ============================================
// Property Management Routes
// API endpoints for adding, reading, updating, and deleting properties
// ============================================

// Import required packages
const express = require('express');        // Create API endpoints
const db = require('../config/database');  // Connect to MySQL

const router = express.Router();

// GET /api/properties
// Return all properties from the database
// If a search term is provided, filter properties by code, owner name, district, or type
router.get('/properties', async (req, res) => {
  // Get the search term from the URL (e.g., /api/properties?search=owner_name)
  const searchTerm = req.query.search || '';

  try {
    let query = 'SELECT * FROM properties ORDER BY created_at DESC';
    let params = [];

    // If user entered a search term, search in multiple fields
    if (searchTerm.trim()) {
      query = `
        SELECT *
        FROM properties
        WHERE property_code LIKE ?
          OR owner_name LIKE ?
          OR district LIKE ?
          OR property_type LIKE ?
        ORDER BY created_at DESC
      `;
      const value = `%${searchTerm}%`;  // Add % for wildcard search
      params = [value, value, value, value];
    }

    // Execute the query and return results
    const [rows] = await db.execute(query, params);
    return res.json(rows);
  } catch (error) {
    console.error('Get properties error:', error);
    return res.status(500).json({ message: 'Unable to get properties.' });
  }
});

// GET /api/properties/:id
// Return a single property by its ID
router.get('/properties/:id', async (req, res) => {
  const { id } = req.params;  // Get property ID from URL

  try {
    // Query for one property with this ID
    const [rows] = await db.execute('SELECT * FROM properties WHERE id = ?', [id]);

    // If property doesn't exist
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    // Return the property
    return res.json(rows[0]);
  } catch (error) {
    console.error('Get property by id error:', error);
    return res.status(500).json({ message: 'Unable to get property.' });
  }
});

// POST /api/properties
// Add a new property to the database
router.post('/properties', async (req, res) => {
  // Get property information from the request body
  const {
    property_code,
    owner_name,
    phone,
    district,
    property_type,
    tax_amount,
    tax_status,
    latitude,
    longitude
  } = req.body;

  // Check that all required fields are filled
  if (!owner_name || !phone || !district || !property_type || !tax_amount || !latitude || !longitude) {
    return res.status(400).json({ message: 'Please fill in all required property fields.' });
  }

  try {
    // Generate a property code if not provided
    const code = property_code || `HPT-${Date.now()}`;
    // Default tax status to 'Unpaid' if not provided
    const status = tax_status || 'Unpaid';

    // Insert the new property into the database
    const [result] = await db.execute(
      `
        INSERT INTO properties (
          property_code,
          owner_name,
          phone,
          district,
          property_type,
          tax_amount,
          tax_status,
          latitude,
          longitude
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [code, owner_name, phone, district, property_type, tax_amount, status, latitude, longitude]
    );

    // Fetch and return the newly created property
    const [rows] = await db.execute('SELECT * FROM properties WHERE id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create property error:', error);
    return res.status(500).json({ message: 'Unable to create property.' });
  }
});

// PUT /api/properties/:id
// Update an existing property
router.put('/properties/:id', async (req, res) => {
  const { id } = req.params;  // Get property ID from URL
  
  // Get updated property information from request body
  const {
    property_code,
    owner_name,
    phone,
    district,
    property_type,
    tax_amount,
    tax_status,
    latitude,
    longitude
  } = req.body;

  try {
    // Update the property in the database
    await db.execute(
      `
        UPDATE properties
        SET
          property_code = ?,
          owner_name = ?,
          phone = ?,
          district = ?,
          property_type = ?,
          tax_amount = ?,
          tax_status = ?,
          latitude = ?,
          longitude = ?
        WHERE id = ?
      `,
      [property_code, owner_name, phone, district, property_type, tax_amount, tax_status, latitude, longitude, id]
    );

    // Fetch and return the updated property
    const [rows] = await db.execute('SELECT * FROM properties WHERE id = ?', [id]);
    return res.json(rows[0]);
  } catch (error) {
    console.error('Update property error:', error);
    return res.status(500).json({ message: 'Unable to update property.' });
  }
});

// DELETE /api/properties/:id
// Remove a property from the database
router.delete('/properties/:id', async (req, res) => {
  const { id } = req.params;  // Get property ID from URL

  try {
    // Delete the property from the database
    await db.execute('DELETE FROM properties WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Property deleted successfully.' });
  } catch (error) {
    console.error('Delete property error:', error);
    return res.status(500).json({ message: 'Unable to delete property.' });
  }
});

module.exports = router;
