const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Medicine = require('../models/Medicine');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

const VALID_STATUSES = ['Pending', 'Processing', 'Delivered', 'Cancelled'];

// GET all orders
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new order
router.post('/', authenticate, async (req, res) => {
  const { customerName, medicine, quantity } = req.body;

  try {
    const parsedQuantity = Number(quantity);
    if (!customerName || !medicine || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Customer name, medicine, and a positive quantity are required' });
    }

    const medicineRecord = await Medicine.findOne({ where: { name: medicine } });
    if (!medicineRecord) return res.status(404).json({ message: 'Medicine not found' });

    const totalPrice = parsedQuantity * Number(medicineRecord.price);
    const newOrder = await Order.create({
      customerName,
      medicine,
      quantity: parsedQuantity,
      totalPrice,
      status: 'Pending',
    });

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update order status
router.patch('/:id', authenticate, requireRole('admin', 'pharmacist'), async (req, res) => {
  const { status } = req.body;

  try {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
