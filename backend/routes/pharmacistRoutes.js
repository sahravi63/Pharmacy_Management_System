// routes/pharmacistRoutes.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const Pharmacist = require('../models/Pharmacist');

// Get pharmacist profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ where: { userId: req.user.id } });
    if (!pharmacist) return res.status(404).json({ message: 'Pharmacist not found' });
    res.json(pharmacist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update pharmacist profile
router.put('/profile', authenticate, async (req, res) => {
  const { phone, address } = req.body;
  try {
    const pharmacist = await Pharmacist.findOne({ where: { userId: req.user.id } });
    if (!pharmacist) return res.status(404).json({ message: 'Pharmacist not found' });
    pharmacist.phone = phone || pharmacist.phone;
    pharmacist.address = address || pharmacist.address;
    await pharmacist.save();
    res.json(pharmacist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;