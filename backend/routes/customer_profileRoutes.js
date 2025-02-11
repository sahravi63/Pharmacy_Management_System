const express = require('express');
const router = express.Router();

// Import your customer model
const Customer = require('../models/Customer');

// GET customer profile (Assuming customer is authenticated)
router.get('/profile', async (req, res) => {
  try {
    // Assuming req.user holds the authenticated user's info (use JWT or sessions for auth)
    const customerId = req.user._id;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT: Update customer profile
router.put('/profile', async (req, res) => {
  const { name, email, phone, address } = req.body;

  try {
    const customerId = req.user._id; // Assuming req.user holds the authenticated user's info
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Update customer profile fields
    customer.name = name || customer.name;
    customer.email = email || customer.email;
    customer.phone = phone || customer.phone;
    customer.address = address || customer.address;

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET customer order history
router.get('/orders', async (req, res) => {
  try {
    const customerId = req.user._id; // Assuming req.user holds the authenticated user's info
    const orders = await Order.find({ customerId }); // Adjust based on your data model

    if (!orders) {
      return res.status(404).json({ message: 'No orders found' });
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
