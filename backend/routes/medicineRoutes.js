// routes/medicineRoutes.js
const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

// POST route to add new medicine
router.post('/add', async (req, res) => {
  try {
    const { name, description, price, stock, expiryDate } = req.body;

    // Create a new medicine including description
    const newMedicine = await Medicine.create({
      name,
      description, // Ensure the description is added
      price,
      stock,
      expiryDate,
    });

    res.status(201).json({ message: 'Medicine added successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding medicine', error });
  }
});

// GET route to fetch all medicines
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.findAll();
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
