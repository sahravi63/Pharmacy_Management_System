const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Medicine = require('../models/Medicine');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const sequelize = require('../config/db');
const { createNotification, notifyStockLevel } = require('../services/notificationService');
const { resolveOrderCustomerName } = require('../utils/orderCustomerName');
const { getPaginationOptions } = require('../utils/validation');

const VALID_STATUSES = ['Pending', 'Processing', 'Delivered', 'Cancelled'];
const STOCK_RESERVED_STATUSES = ['Pending', 'Processing', 'Delivered'];

router.get('/', authenticate, async (req, res) => {
  try {
    const { limit, offset } = getPaginationOptions(req.query);
    const where = req.user.role === 'customer' ? { userId: req.user.id } : undefined;
    const orders = await Order.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Unable to fetch orders' });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { customerName, medicine, medicineId, quantity } = req.body;
  const parsedQuantity = Number(quantity);
  const resolvedCustomerName = resolveOrderCustomerName({
    role: req.user?.role,
    userName: req.user?.name,
    providedCustomerName: customerName,
  });

  if (!medicine || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({ message: 'Medicine and a positive quantity are required' });
  }

  if (req.user?.role !== 'customer' && !resolvedCustomerName) {
    return res.status(400).json({ message: 'Customer name is required' });
  }

  const transaction = await sequelize.transaction();

  try {
    const medicineRecord = await Medicine.findOne({
      where: medicineId ? { id: medicineId } : { name: medicine },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!medicineRecord) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Medicine not found' });
    }

    if (medicineRecord.expiryDate && new Date(medicineRecord.expiryDate) < new Date()) {
      await transaction.rollback();
      return res.status(400).json({ message: 'This medicine is expired and cannot be ordered' });
    }

    if (medicineRecord.requiresPrescription && req.user?.role === 'customer') {
      const prescription = await sequelize.models.Prescription.findOne({
        where: { userId: req.user.id, medicineId: medicineRecord.id, status: 'Filled' },
        transaction,
      });

      if (!prescription) {
        await transaction.rollback();
        return res.status(403).json({ message: 'A valid prescription is required for this medicine' });
      }
    }

    if (medicineRecord.stock < parsedQuantity) {
      await transaction.rollback();
      return res.status(400).json({ message: `Only ${medicineRecord.stock} units available` });
    }

    medicineRecord.stock -= parsedQuantity;
    await medicineRecord.save({ transaction });

    const totalPrice = parsedQuantity * Number(medicineRecord.price);
    const newOrder = await Order.create({
      userId: req.user?.role === 'customer' ? req.user.id : null,
      customerName: resolvedCustomerName,
      medicine: medicineRecord.name,
      medicineId: medicineRecord.id,
      quantity: parsedQuantity,
      totalPrice,
      status: 'Pending',
    }, { transaction });

    await createNotification({
      type: 'order',
      title: 'Order placed',
      message: `${parsedQuantity} units of ${medicineRecord.name} reserved for ${resolvedCustomerName}.`,
      medicineId: medicineRecord.id,
      metadata: { orderId: newOrder.id, quantity: parsedQuantity, stock: medicineRecord.stock },
    }, { transaction });
    await notifyStockLevel(medicineRecord, { transaction });
    await transaction.commit();

    res.status(201).json(newOrder);
  } catch (err) {
    await transaction.rollback();
    res.status(400).json({ message: 'Unable to place order' });
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

    if (req.user.role === 'customer') {
      await transaction.rollback();
      return res.status(403).json({ message: 'Forbidden' });
    }

    const medicineRecord = await Medicine.findOne({
      where: order.medicineId ? { id: order.medicineId } : { name: order.medicine },
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
    res.status(400).json({ message: 'Unable to update order' });
  }
});

module.exports = router;
