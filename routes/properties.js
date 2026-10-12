// ============================================
// Property Management Routes
// ============================================
const express = require('express');
const db = require('../config/database');
const demoStore = require('../data/demoStore');
const {
  parseCoordinate,
  parsePositiveInteger,
  parsePositiveNumber
} = require('../lib/validation');

const router = express.Router();
const isDemo = () => process.env.VERCEL || process.env.DEMO_MODE === 'true';

// GET /api/properties
router.get('/properties', async (req, res) => {
  const searchTerm = (req.query.search || '').trim().toLowerCase();

  if (isDemo()) {
    const rows = !searchTerm
      ? demoStore.properties
      : demoStore.properties.filter((property) =>
          [property.property_code, property.owner_name, property.district, property.property_type]
            .some((value) => String(value).toLowerCase().includes(searchTerm))
        );
    return res.json(rows);
  }

  try {
    let query = 'SELECT * FROM properties ORDER BY created_at DESC';
    let params = [];
    if (searchTerm) {
      query = `SELECT * FROM properties
        WHERE property_code LIKE ? OR owner_name LIKE ? OR district LIKE ? OR property_type LIKE ?
        ORDER BY created_at DESC`;
      const value = `%${searchTerm}%`;
      params = [value, value, value, value];
    }
    const [rows] = await db.execute(query, params);
    return res.json(rows);
  } catch (error) {
    console.error('Get properties error:', error);
    return res.status(500).json({ message: 'Unable to get properties.' });
  }
});

// GET /api/properties/:id
router.get('/properties/:id', async (req, res) => {
  const id = parsePositiveInteger(req.params.id);
  if (id === null) return res.status(400).json({ message: 'Property ID must be a positive integer.' });

  if (isDemo()) {
    const property = demoStore.properties.find((item) => item.id === id);
    return property ? res.json(property) : res.status(404).json({ message: 'Property not found.' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM properties WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Property not found.' });
    return res.json(rows[0]);
  } catch (error) {
    console.error('Get property by id error:', error);
    return res.status(500).json({ message: 'Unable to get property.' });
  }
});

// POST /api/properties
router.post('/properties', async (req, res) => {
  const { property_code, owner_name, phone, district, property_type, tax_amount, tax_status, latitude, longitude } = req.body;

  if (![owner_name, phone, district, property_type].every((value) => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ message: 'Please fill in all required property fields.' });
  }

  const normalizedTaxAmount = parsePositiveNumber(tax_amount);
  const normalizedLatitude = parseCoordinate(latitude, -90, 90);
  const normalizedLongitude = parseCoordinate(longitude, -180, 180);
  if (normalizedTaxAmount === null) {
    return res.status(400).json({ message: 'Tax amount must be a positive number.' });
  }
  if (normalizedLatitude === null || normalizedLongitude === null) {
    return res.status(400).json({ message: 'Latitude or longitude is outside the valid range.' });
  }
  if (tax_status && !['Paid', 'Unpaid'].includes(tax_status)) {
    return res.status(400).json({ message: 'Tax status must be Paid or Unpaid.' });
  }

  if (isDemo()) {
    const newProperty = {
      id: demoStore.properties.length ? Math.max(...demoStore.properties.map((item) => item.id)) + 1 : 1,
      property_code: property_code || `HPT-${Date.now()}`,
      owner_name,
      phone,
      district,
      property_type,
      tax_amount: normalizedTaxAmount,
      tax_status: tax_status || 'Unpaid',
      latitude: normalizedLatitude,
      longitude: normalizedLongitude,
      created_at: new Date().toISOString()
    };
    demoStore.properties.unshift(newProperty);
    return res.status(201).json(newProperty);
  }

  try {
    const code = property_code || `HPT-${Date.now()}`;
    const status = tax_status || 'Unpaid';
    const [result] = await db.execute(
      `INSERT INTO properties (property_code, owner_name, phone, district, property_type, tax_amount, tax_status, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, owner_name, phone, district, property_type, normalizedTaxAmount, status, normalizedLatitude, normalizedLongitude]
    );
    const [rows] = await db.execute('SELECT * FROM properties WHERE id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create property error:', error);
    return res.status(500).json({ message: 'Unable to create property.' });
  }
});

// PUT /api/properties/:id
router.put('/properties/:id', async (req, res) => {
  const id = parsePositiveInteger(req.params.id);
  if (id === null) return res.status(400).json({ message: 'Property ID must be a positive integer.' });
  const fields = req.body;

  if (Object.hasOwn(fields, 'tax_amount') && parsePositiveNumber(fields.tax_amount) === null) {
    return res.status(400).json({ message: 'Tax amount must be a positive number.' });
  }
  if (Object.hasOwn(fields, 'latitude') && parseCoordinate(fields.latitude, -90, 90) === null) {
    return res.status(400).json({ message: 'Latitude is outside the valid range.' });
  }
  if (Object.hasOwn(fields, 'longitude') && parseCoordinate(fields.longitude, -180, 180) === null) {
    return res.status(400).json({ message: 'Longitude is outside the valid range.' });
  }
  if (Object.hasOwn(fields, 'tax_status') && !['Paid', 'Unpaid'].includes(fields.tax_status)) {
    return res.status(400).json({ message: 'Tax status must be Paid or Unpaid.' });
  }

  if (isDemo()) {
    const index = demoStore.properties.findIndex((item) => item.id === id);
    if (index === -1) return res.status(404).json({ message: 'Property not found.' });
    const normalizedFields = {
      ...fields,
      ...(Object.hasOwn(fields, 'tax_amount') && { tax_amount: Number(fields.tax_amount) }),
      ...(Object.hasOwn(fields, 'latitude') && { latitude: Number(fields.latitude) }),
      ...(Object.hasOwn(fields, 'longitude') && { longitude: Number(fields.longitude) })
    };
    demoStore.properties[index] = { ...demoStore.properties[index], ...normalizedFields, id };
    return res.json(demoStore.properties[index]);
  }

  try {
    const { property_code, owner_name, phone, district, property_type, tax_amount, tax_status, latitude, longitude } = fields;
    await db.execute(
      `UPDATE properties SET property_code = ?, owner_name = ?, phone = ?, district = ?, property_type = ?, tax_amount = ?, tax_status = ?, latitude = ?, longitude = ? WHERE id = ?`,
      [property_code, owner_name, phone, district, property_type, tax_amount, tax_status, latitude, longitude, id]
    );
    const [rows] = await db.execute('SELECT * FROM properties WHERE id = ?', [id]);
    return res.json(rows[0]);
  } catch (error) {
    console.error('Update property error:', error);
    return res.status(500).json({ message: 'Unable to update property.' });
  }
});

// DELETE /api/properties/:id
router.delete('/properties/:id', async (req, res) => {
  const id = parsePositiveInteger(req.params.id);
  if (id === null) return res.status(400).json({ message: 'Property ID must be a positive integer.' });

  if (isDemo()) {
    const index = demoStore.properties.findIndex((item) => item.id === id);
    if (index === -1) return res.status(404).json({ message: 'Property not found.' });
    demoStore.properties.splice(index, 1);
    return res.json({ success: true, message: 'Property deleted successfully.' });
  }

  try {
    await db.execute('DELETE FROM properties WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Property deleted successfully.' });
  } catch (error) {
    console.error('Delete property error:', error);
    return res.status(500).json({ message: 'Unable to delete property.' });
  }
});

module.exports = router;
