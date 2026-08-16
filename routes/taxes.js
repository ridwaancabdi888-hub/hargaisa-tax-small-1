// ============================================
// Tax Management Routes
// ============================================
const express = require('express');
const db = require('../config/database');
const demoStore = require('../data/demoStore');

const router = express.Router();
const isDemo = () => process.env.VERCEL || process.env.DEMO_MODE === 'true';

// GET /api/taxes
router.get('/taxes', async (req, res) => {
  if (isDemo()) {
    const rows = demoStore.properties.map((property) => {
      const payment = demoStore.payments.find((item) => item.property_id === property.id);
      return {
        id: property.id,
        property_code: property.property_code,
        owner_name: property.owner_name,
        tax_amount: property.tax_amount,
        tax_status: property.tax_status,
        payment_amount: payment ? payment.amount : null,
        payment_date: payment ? payment.payment_date : null
      };
    });
    return res.json(rows);
  }

  try {
    const [rows] = await db.execute(`
      SELECT p.id, p.property_code, p.owner_name, p.tax_amount, p.tax_status,
             tp.amount AS payment_amount, tp.payment_date
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
router.post('/taxes/pay', async (req, res) => {
  const { property_id, amount, payment_date } = req.body;

  if (!property_id || !amount || !payment_date) {
    return res.status(400).json({ message: 'Property ID, amount and date are required.' });
  }

  if (isDemo()) {
    const id = Number(property_id);
    const property = demoStore.properties.find((item) => item.id === id);
    if (!property) return res.status(404).json({ message: 'Property not found.' });

    property.tax_status = 'Paid';
    demoStore.payments.push({
      id: demoStore.payments.length + 1,
      property_id: id,
      amount: Number(amount),
      payment_date,
      status: 'Paid'
    });

    return res.json({ success: true, message: 'Payment recorded successfully.' });
  }

  try {
    const [propertyRows] = await db.execute('SELECT * FROM properties WHERE id = ?', [property_id]);
    if (propertyRows.length === 0) return res.status(404).json({ message: 'Property not found.' });

    await db.execute(
      'INSERT INTO tax_payments (property_id, amount, payment_date, status) VALUES (?, ?, ?, ?)',
      [property_id, amount, payment_date, 'Paid']
    );
    await db.execute('UPDATE properties SET tax_status = ? WHERE id = ?', ['Paid', property_id]);

    return res.json({ success: true, message: 'Payment recorded successfully.' });
  } catch (error) {
    console.error('Tax payment error:', error);
    return res.status(500).json({ message: 'Unable to record payment.' });
  }
});

module.exports = router;
