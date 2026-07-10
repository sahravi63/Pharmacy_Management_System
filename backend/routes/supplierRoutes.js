const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { validateSupplierPayload, getPaginationOptions } = require('../utils/validation');

router.use(authenticate, requireRole('admin', 'pharmacist'));

router.get('/', async (req, res) => {
  try {
    const { limit, offset } = getPaginationOptions(req.query);
    const suppliers = await Supplier.findAll({
      order: [['name', 'ASC']],
      limit,
      offset,
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suppliers' });
  }
});

router.post('/', async (req, res) => {
  const validation = validateSupplierPayload(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Error creating supplier' });
  }
});

module.exports = router;
