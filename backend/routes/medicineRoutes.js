const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const sequelize = require('../config/db');
const { Op } = require('sequelize');
const Batch = require('../models/Batch');
const { createNotification, notifyRestock, notifyStockLevel } = require('../services/notificationService');
const { createBatchEntry } = require('../utils/inventoryUtils');

const validateMedicine = ({ name, price, stock }) => {
  if (!name || typeof name !== 'string') return 'Medicine name is required';
  if (!Number.isFinite(Number(price)) || Number(price) < 0) return 'Price must be a non-negative number';
  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) return 'Stock must be a non-negative integer';
  return null;
};

router.post('/add', authenticate, requireRole('admin', 'pharmacist'), async (req, res) => {
  const { name, description, price, stock, expiryDate, requiresPrescription, prescriptionNotes } = req.body;
  const validationError = validateMedicine(req.body);
  if (validationError) return res.status(400).json({ message: validationError });

  const transaction = await sequelize.transaction();

  try {
    const existingMedicine = await Medicine.findOne({ where: { name: name.trim() } });
    if (existingMedicine) {
      await transaction.rollback();
      return res.status(409).json({ message: 'A medicine with this name already exists' });
    }

    const medicine = await Medicine.create({
      name: name.trim(),
      description,
      price: Number(price),
      stock: Number(stock),
      expiryDate,
      requiresPrescription: Boolean(requiresPrescription),
      prescriptionNotes,
    }, { transaction });

    if (Number(stock) > 0 && expiryDate) {
      await Batch.create(createBatchEntry({
        medicineId: medicine.id,
        batchNo: `AUTO-${medicine.id}`,
        expiryDate,
        quantity: Number(stock),
        costPrice: Number(price),
      }), { transaction });
    }

    await notifyStockLevel(medicine, { transaction });
    await transaction.commit();

    res.status(201).json({ message: 'Medicine added successfully!', medicine });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Error adding medicine', error: error.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { q, limit = 100, offset = 0 } = req.query;
    const where = q ? { name: { [Op.like]: `%${q}%` } } : undefined;
    const medicines = await Medicine.findAll({
      where,
      order: [['name', 'ASC']],
      limit: Number(limit),
      offset: Number(offset),
    });
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medicines', error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medicine', error: error.message });
  }
});

router.put('/:id', authenticate, requireRole('admin', 'pharmacist'), async (req, res) => {
  const validationError = validateMedicine(req.body);
  if (validationError) return res.status(400).json({ message: validationError });

  const transaction = await sequelize.transaction();

  try {
    const medicine = await Medicine.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!medicine) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const previousStock = medicine.stock;
    await medicine.update({
      name: req.body.name.trim(),
      description: req.body.description,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      expiryDate: req.body.expiryDate,
      requiresPrescription: Boolean(req.body.requiresPrescription),
      prescriptionNotes: req.body.prescriptionNotes,
    }, { transaction });

    await notifyRestock(medicine, previousStock, { transaction });
    await notifyStockLevel(medicine, { transaction });
    await transaction.commit();

    res.json({ message: 'Medicine updated successfully', medicine });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Error updating medicine', error: error.message });
  }
});

router.patch('/:id/stock', authenticate, requireRole('admin', 'pharmacist'), async (req, res) => {
  const adjustment = Number(req.body.adjustment);

  if (!Number.isInteger(adjustment) || adjustment === 0) {
    return res.status(400).json({ message: 'Stock adjustment must be a non-zero integer' });
  }

  const transaction = await sequelize.transaction();

  try {
    const medicine = await Medicine.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!medicine) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const previousStock = medicine.stock;
    const nextStock = previousStock + adjustment;
    if (nextStock < 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Stock cannot go below zero' });
    }

    medicine.stock = nextStock;
    await medicine.save({ transaction });

    await createNotification({
      type: 'stock_adjustment',
      title: 'Stock adjusted',
      message: `${medicine.name} stock changed from ${previousStock} to ${nextStock}.`,
      medicineId: medicine.id,
      metadata: { previousStock, stock: nextStock, adjustment },
    }, { transaction });
    await notifyRestock(medicine, previousStock, { transaction });
    await notifyStockLevel(medicine, { transaction });
    await transaction.commit();

    res.json({ message: 'Stock updated successfully', medicine });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Error updating stock', error: error.message });
  }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const medicine = await Medicine.findByPk(req.params.id, { transaction });
    if (!medicine) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Medicine not found' });
    }

    await createNotification({
      type: 'stock_adjustment',
      title: 'Medicine deleted',
      message: `${medicine.name} was deleted from inventory.`,
      medicineId: medicine.id,
      metadata: { stock: medicine.stock },
    }, { transaction });

    await medicine.destroy({ transaction });
    await transaction.commit();

    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Error deleting medicine', error: error.message });
  }
});

module.exports = router;
