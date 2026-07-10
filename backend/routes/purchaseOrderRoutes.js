const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/PurchaseOrder');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { validatePurchaseOrderPayload, getPaginationOptions } = require('../utils/validation');

router.use(authenticate, requireRole('admin', 'pharmacist'));

router.get('/', async (req, res) => {
  try {
    const { limit, offset } = getPaginationOptions(req.query);
    const purchaseOrders = await PurchaseOrder.findAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json(purchaseOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching purchase orders' });
  }
});

router.post('/', async (req, res) => {
  const validation = validatePurchaseOrderPayload(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    const purchaseOrder = await PurchaseOrder.create(req.body);
    res.status(201).json(purchaseOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error creating purchase order' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByPk(req.params.id);
    if (!purchaseOrder) return res.status(404).json({ message: 'Purchase order not found' });
    await purchaseOrder.update(req.body);
    res.json(purchaseOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating purchase order' });
  }
});

module.exports = router;
