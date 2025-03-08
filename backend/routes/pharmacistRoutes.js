const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const Pharmacist = require('../models/pharmacist');

// Get pharmacist profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const pharmacistId = req.user.id; // Assuming req.user contains pharmacist data
    const pharmacist = await Pharmacist.findByPk(pharmacistId);

    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    res.json(pharmacist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update pharmacist profile
router.put('/profile', authenticate, async (req, res) => {
  const { name, email, phone, licenseNumber, address } = req.body;

  try {
    const pharmacistId = req.user.id; // Assuming req.user contains pharmacist data
    const pharmacist = await Pharmacist.findByPk(pharmacistId);

    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    // Update pharmacist information
    pharmacist.name = name || pharmacist.name;
    pharmacist.email = email || pharmacist.email;
    pharmacist.phone = phone || pharmacist.phone;
    pharmacist.licenseNumber = licenseNumber || pharmacist.licenseNumber;
    pharmacist.address = address || pharmacist.address;

    const updatedPharmacist = await pharmacist.save();
    res.json(updatedPharmacist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Pharmacist can view all orders (optional, if needed for the application)
router.get('/orders', authenticate, async (req, res) => {
  try {
    const pharmacistId = req.user.id;

    // Example of fetching orders related to the pharmacist (logic can vary)
    const orders = await Order.findAll({ where: { pharmacistId } });

    if (!orders.length) {
      return res.status(404).json({ message: 'No orders found for this pharmacist' });
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
