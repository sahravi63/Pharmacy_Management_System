const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Medicine = require('../models/Medicine');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const sequelize = require('../config/db');
const { createNotification, notifyStockLevel } = require('../services/notificationService');

const VALID_STATUSES = ['Pending', 'Processing', 'Delivered', 'Cancelled'];
const STOCK_RESERVED_STATUSES = ['Pending', 'Processing', 'Delivered'];

router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { customerName, medicine, quantity } = req.body;
  const parsedQuantity = Number(quantity);

  if (!customerName || !medicine || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({ message: 'Customer name, medicine, and a positive quantity are required' });
  }

  const transaction = await sequelize.transaction();

  try {
    const medicineRecord = await Medicine.findOne({
      where: { name: medicine },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!medicineRecord) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Medicine not found' });
    }

    if (medicineRecord.stock < parsedQuantity) {
      await transaction.rollback();
      return res.status(400).json({ message: `Only ${medicineRecord.stock} units available` });
    }

    medicineRecord.stock -= parsedQuantity;
    await medicineRecord.save({ transaction });

    const totalPrice = parsedQuantity * Number(medicineRecord.price);
    const newOrder = await Order.create({
      customerName,
      medicine: medicineRecord.name,
      quantity: parsedQuantity,
      totalPrice,
      status: 'Pending',
    }, { transaction });

    await createNotification({
      type: 'order',
      title: 'Order placed',
      message: `${parsedQuantity} units of ${medicineRecord.name} reserved for ${customerName}.`,
      medicineId: medicineRecord.id,
      metadata: { orderId: newOrder.id, quantity: parsedQuantity, stock: medicineRecord.stock },
    }, { transaction });
    await notifyStockLevel(medicineRecord, { transaction });
    await transaction.commit();

    res.status(201).json(newOrder);
  } catch (err) {
    await transaction.rollback();
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id', authenticate, requireRole('admin', 'pharmacist'), async (req, res) => {
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    const medicineRecord = await Medicine.findOne({
      where: { name: order.medicine },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!medicineRecord) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Medicine not found for this order' });
    }

    const wasReserved = STOCK_RESERVED_STATUSES.includes(order.status);
    const willBeReserved = STOCK_RESERVED_STATUSES.includes(status);

    if (wasReserved && !willBeReserved) {
      medicineRecord.stock += order.quantity;
      await medicineRecord.save({ transaction });
    } else if (!wasReserved && willBeReserved) {
      if (medicineRecord.stock < order.quantity) {
        await transaction.rollback();
        return res.status(400).json({ message: `Only ${medicineRecord.stock} units available` });
      }
      medicineRecord.stock -= order.quantity;
      await medicineRecord.save({ transaction });
    }

    order.status = status;
    await order.save({ transaction });

    await createNotification({
      type: 'order',
      title: 'Order status updated',
      message: `Order #${order.id} changed to ${status}.`,
      medicineId: medicineRecord.id,
      metadata: { orderId: order.id, status, stock: medicineRecord.stock },
    }, { transaction });
    await notifyStockLevel(medicineRecord, { transaction });
    await transaction.commit();

    res.json(order);
  } catch (err) {
    await transaction.rollback();
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
