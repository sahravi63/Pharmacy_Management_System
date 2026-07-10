const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const Customer = require('../models/customer');
const { validateCustomerProfilePayload } = require('../utils/validation');

// GET customer profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { userId: req.user.id },
      attributes: ['customerID', 'name', 'email', 'phone', 'address']
    });

    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Profile fetched', user: customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST update customer profile
router.post('/profile', authenticate, async (req, res) => {
  const validation = validateCustomerProfilePayload(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  const { name, email, phone, address } = req.body;

  try {
    const customer = await Customer.findOne({ where: { userId: req.user.id } });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    if (email && email !== customer.email) {
      const existing = await Customer.findOne({ where: { email } });
      if (existing) return res.status(400).json({ message: 'Email already in use' });
      customer.email = email;
    }

    customer.name = name || customer.name;
    customer.phone = phone || customer.phone;
    customer.address = address || customer.address;
    await customer.save();

    res.json({ message: 'Profile updated successfully', customer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update customer profile (only phone & address)
router.put('/profile', authenticate, async (req, res) => {
  const validation = validateCustomerProfilePayload(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  const { phone, address } = req.body;

  try {
    const customer = await Customer.findOne({ where: { userId: req.user.id } });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    customer.phone = phone || customer.phone;
    customer.address = address || customer.address;
    await customer.save();

    res.json({ message: 'Profile updated successfully', customer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
