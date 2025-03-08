const express = require('express');
const router = express.Router();

// Import your customer model
const Customer = require('../models/customer');


router.get('/profile', async (req, res) => {
  try {
   
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


router.put('/profile', async (req, res) => {
  const { name, email, phone, address } = req.body;

  try {
    const customerId = req.user._id; 
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    
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


router.get('/orders', async (req, res) => {
  try {
    const customerId = req.user._id; 
    const orders = await Order.find({ customerId }); 

    if (!orders) {
      return res.status(404).json({ message: 'No orders found' });
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
