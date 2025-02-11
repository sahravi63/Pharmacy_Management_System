const express = require('express');
const router = express.Router();
const Order = require('../models/order');

// GET all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll(); // Correct method to retrieve all orders
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new order
router.post('/', async (req, res) => {
  const { customerName, medicine, quantity, totalPrice, status } = req.body;

  try {
    // Correct way to create a new order in Sequelize
    const newOrder = await Order.create({
      customerName,
      medicine,
      quantity,
      totalPrice: quantity * 5, // Assuming price per unit is $5
      status: 'Pending', // Default status when creating a new order
    });

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH: Update order status
router.patch('/:id', async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findByPk(req.params.id); // Correct way to find order by ID
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update the order status
    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
