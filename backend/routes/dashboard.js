const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');
const Medicine = require('../models/Medicine');
const { Sales } = require('../models/sales');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { Op, fn, col } = require('sequelize');
const { getLowStockThreshold } = require('../utils/stockConfig');

// GET /dashboard/summary
router.get('/summary', authenticate, requireRole('admin', 'pharmacist'), async (req, res) => {
  try {
    const totalCustomers = await Customer.count();

    const totalMedicines = await Medicine.count();

    const lowStockThreshold = getLowStockThreshold();
    const lowStockMedicines = await Medicine.count({
      where: { stock: { [Op.lte]: lowStockThreshold } },
    });

    const totalSales = await Sales.sum('totalAmount');

    // For progress chart - optional: sales trend by date (last 7 days)
    const salesTrend = await Sales.findAll({
      attributes: [
        [fn('DATE', col('date')), 'saleDate'],
        [fn('SUM', col('totalAmount')), 'total']
      ],
      group: ['saleDate'],
      order: [['saleDate', 'ASC']],
      limit: 7
    });

    res.json({
      totalCustomers,
      totalMedicines,
      lowStockMedicines,
      totalSales: totalSales || 0,
      totalSalesAmount: totalSales || 0,
      lowStockCount: lowStockMedicines,
      stockProgress: totalMedicines ? Math.round(((totalMedicines - lowStockMedicines) / totalMedicines) * 100) : 0,
      salesTrend,
    });
  } catch (err) {
    console.error('Dashboard Error:', err);
    res.status(500).json({ message: 'Dashboard summary fetch failed', error: err.message });
  }
});

module.exports = router;
