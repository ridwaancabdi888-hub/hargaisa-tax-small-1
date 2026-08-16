// ============================================
// Dashboard and Reports Routes
// ============================================
const express = require('express');
const db = require('../config/database');
const demoStore = require('../data/demoStore');

const router = express.Router();
const isDemo = () => process.env.VERCEL || process.env.DEMO_MODE === 'true';

// GET /api/dashboard
router.get('/dashboard', async (req, res) => {
  if (isDemo()) return res.json(demoStore.getStats());

  try {
    const [stats] = await db.execute(`
      SELECT
        COUNT(*) AS total_properties,
        SUM(CASE WHEN tax_status = 'Paid' THEN 1 ELSE 0 END) AS paid_properties,
        SUM(CASE WHEN tax_status = 'Unpaid' THEN 1 ELSE 0 END) AS unpaid_properties,
        SUM(CASE WHEN tax_status = 'Paid' THEN tax_amount ELSE 0 END) AS total_tax_collected
      FROM properties
    `);
    const result = stats[0];
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
router.get('/reports', async (req, res) => {
  if (isDemo()) {
    return res.json({ stats: demoStore.getStats(), properties: demoStore.properties });
  }

  try {
    const [stats] = await db.execute(`
      SELECT
        COUNT(*) AS total_properties,
        SUM(CASE WHEN tax_status = 'Paid' THEN 1 ELSE 0 END) AS paid_properties,
        SUM(CASE WHEN tax_status = 'Unpaid' THEN 1 ELSE 0 END) AS unpaid_properties,
        SUM(CASE WHEN tax_status = 'Paid' THEN tax_amount ELSE 0 END) AS total_tax_collected
      FROM properties
    `);
    const [properties] = await db.execute('SELECT * FROM properties ORDER BY created_at DESC');
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
