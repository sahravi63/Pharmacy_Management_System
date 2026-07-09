const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

const validateMedicine = ({ name, price, stock }) => {
  if (!name || typeof name !== 'string') return 'Medicine name is required';
  if (!Number.isFinite(Number(price)) || Number(price) < 0) return 'Price must be a non-negative number';
  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) return 'Stock must be a non-negative integer';
  return null;
};

// POST add medicine
router.post('/add', authenticate, requireRole('admin', 'pharmacist'), async (req, res) => {
  const { name, description, price, stock, expiryDate } = req.body;
  const validationError = validateMedicine(req.body);
  if (validationError) return res.status(400).json({ message: validationError });

  try {
    await Medicine.create({ name, description, price: Number(price), stock: Number(stock), expiryDate });
    res.status(201).json({ message: 'Medicine added successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding medicine', error });
  }
});

// GET all medicines
router.get('/', authenticate, async (req, res) => {
  try {
    const medicines = await Medicine.findAll();
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medicines', error });
  }
});

module.exports = router;
