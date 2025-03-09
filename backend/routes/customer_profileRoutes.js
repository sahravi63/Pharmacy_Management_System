const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const Customer = require('../models/customer');

// Get customer profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    console.log("Decoded User Object:", req.user); // Debugging

    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ message: 'Unauthorized: No customer ID found' });
    }

    const customer = await Customer.findByPk(customerId, {
      attributes: ['customerID', 'name', 'email', 'phone', 'address']
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Profile information', user: customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update customer profile (POST method)
router.post('/profile', authenticate, async (req, res) => {
  const { name, email, phone, address } = req.body;

  try {
    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ message: 'Unauthorized: No customer ID found' });
    }

    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Prevent email duplication
    if (email && email !== customer.email) {
      const existingEmail = await Customer.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      customer.email = email;
    }

    // Update customer fields
    customer.name = name || customer.name;
    customer.phone = phone || customer.phone;
    customer.address = address || customer.address;

    // Save updated customer
    await customer.save();
    res.json({ message: 'Profile updated successfully', customer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  const { phone, address } = req.body;

  try {
    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ message: 'Unauthorized: No customer ID found' });
    }

    // Fetch name and email from authenticated user
    const { name, email } = req.user; // Assuming this data comes from the JWT

    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Update customer fields
    customer.name = name; // Ensuring name from /auth/profile is used
    customer.email = email; // Ensuring email from /auth/profile is used
    customer.phone = phone || customer.phone; // Updating phone if provided
    customer.address = address || customer.address; // Updating address if provided

    // Save updated customer
    await customer.save();
    res.json({ message: 'Profile updated successfully', customer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
