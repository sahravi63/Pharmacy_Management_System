const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

router.use(authenticate, requireRole('admin', 'pharmacist'));

router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({ order: [['name', 'ASC']] });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Error creating supplier', error: error.message });
  }
});

module.exports = router;
