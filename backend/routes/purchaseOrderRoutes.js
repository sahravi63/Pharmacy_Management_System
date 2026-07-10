const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/PurchaseOrder');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

router.use(authenticate, requireRole('admin', 'pharmacist'));

router.get('/', async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.findAll({ order: [['createdAt', 'DESC']] });
    res.json(purchaseOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching purchase orders', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.create(req.body);
    res.status(201).json(purchaseOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error creating purchase order', error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByPk(req.params.id);
    if (!purchaseOrder) return res.status(404).json({ message: 'Purchase order not found' });
    await purchaseOrder.update(req.body);
    res.json(purchaseOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating purchase order', error: error.message });
  }
});

module.exports = router;
