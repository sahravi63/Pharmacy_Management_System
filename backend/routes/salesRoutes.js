const express = require('express');
const router = express.Router();
const { Sales, SalesItems } = require('../models/sales');
const Medicine = require('../models/Medicine');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const sequelize = require('../config/db');
const { createNotification, notifyStockLevel } = require('../services/notificationService');

router.use(authenticate);

const normalizeItems = (itemsSold = []) => {
  const itemsByName = new Map();

  for (const item of itemsSold) {
    const name = String(item.name || '').trim();
    const quantity = Number(item.quantity);

    if (!name || !Number.isInteger(quantity) || quantity <= 0) {
      return { error: 'Each item must include a name and positive integer quantity' };
    }

    const existing = itemsByName.get(name) || { name, quantity: 0 };
    existing.quantity += quantity;
    itemsByName.set(name, existing);
  }

  return { items: Array.from(itemsByName.values()) };
};

const lockMedicinesForItems = async (items, transaction) => {
  const medicines = [];

  for (const item of items) {
    const medicine = await Medicine.findOne({
      where: { name: item.name },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!medicine) {
      throw new Error(`Medicine not found: ${item.name}`);
    }

    medicines.push(medicine);
  }

  return medicines;
};

const deductStockForItems = async (items, transaction) => {
  const medicines = await lockMedicinesForItems(items, transaction);
  const saleItems = [];

  for (const item of items) {
    const medicine = medicines.find((record) => record.name === item.name);
    if (medicine.stock < item.quantity) {
      throw new Error(`Only ${medicine.stock} units available for ${medicine.name}`);
    }

    medicine.stock -= item.quantity;
    await medicine.save({ transaction });
    saleItems.push({
      name: medicine.name,
      quantity: item.quantity,
      price: Number(medicine.price),
      medicine,
    });
  }

  return saleItems;
};

const restoreStockForSale = async (saleId, transaction) => {
  const existingItems = await SalesItems.findAll({
    where: { saleId },
    transaction,
  });

  for (const item of existingItems) {
    const medicine = await Medicine.findOne({
      where: { name: item.name },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (medicine) {
      medicine.stock += item.quantity;
      await medicine.save({ transaction });
      await createNotification({
        type: 'sale',
        title: 'Sale stock restored',
        message: `${item.quantity} units of ${medicine.name} returned to stock.`,
        medicineId: medicine.id,
        metadata: { saleId, quantity: item.quantity, stock: medicine.stock },
      }, { transaction });
    }
  }
};

router.post('/', requireRole('admin', 'pharmacist'), async (req, res) => {
  const { date, customerName, itemsSold } = req.body;

  if (!customerName || !Array.isArray(itemsSold) || itemsSold.length === 0) {
    return res.status(400).json({ message: 'Customer name and items sold are required' });
  }

  const { items, error } = normalizeItems(itemsSold);
  if (error) return res.status(400).json({ message: error });

  const transaction = await sequelize.transaction();

  try {
    const saleItems = await deductStockForItems(items, transaction);
    const totalAmount = saleItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const newSale = await Sales.create({
      date,
      customerName,
      totalAmount,
    }, { transaction });

    await Promise.all(saleItems.map(item => SalesItems.create({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      saleId: newSale.id,
    }, { transaction })));

    for (const item of saleItems) {
      await createNotification({
        type: 'sale',
        title: 'Sale recorded',
        message: `${item.quantity} units of ${item.name} sold to ${customerName}.`,
        medicineId: item.medicine.id,
        metadata: { saleId: newSale.id, quantity: item.quantity, stock: item.medicine.stock },
      }, { transaction });
      await notifyStockLevel(item.medicine, { transaction });
    }

    await transaction.commit();

    const sale = await Sales.findByPk(newSale.id, {
      include: [{ model: SalesItems, as: 'itemsSold' }],
    });
    res.status(201).json(sale);
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const sales = await Sales.findAll({
      include: [{ model: SalesItems, as: 'itemsSold' }],
      order: [['createdAt', 'DESC']],
    });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const sale = await Sales.findByPk(req.params.id, {
      include: [{ model: SalesItems, as: 'itemsSold' }],
    });

    if (!sale) return res.status(404).json({ message: 'Sale not found' });

    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', requireRole('admin', 'pharmacist'), async (req, res) => {
  const { date, customerName, itemsSold } = req.body;
  const transaction = await sequelize.transaction();

  try {
    const sale = await Sales.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Sale not found' });
    }

    sale.date = date || sale.date;
    sale.customerName = customerName || sale.customerName;

    if (Array.isArray(itemsSold)) {
      const { items, error } = normalizeItems(itemsSold);
      if (error) {
        await transaction.rollback();
        return res.status(400).json({ message: error });
      }

      await restoreStockForSale(sale.id, transaction);
      await SalesItems.destroy({ where: { saleId: sale.id }, transaction });

      const saleItems = await deductStockForItems(items, transaction);
      sale.totalAmount = saleItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

      await Promise.all(saleItems.map(item => SalesItems.create({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        saleId: sale.id,
      }, { transaction })));

      for (const item of saleItems) {
        await notifyStockLevel(item.medicine, { transaction });
      }
    }

    await sale.save({ transaction });
    await transaction.commit();

    const updatedSale = await Sales.findByPk(sale.id, {
      include: [{ model: SalesItems, as: 'itemsSold' }],
    });
    res.json(updatedSale);
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', requireRole('admin', 'pharmacist'), async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const sale = await Sales.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Sale not found' });
    }

    await restoreStockForSale(sale.id, transaction);
    await SalesItems.destroy({ where: { saleId: sale.id }, transaction });
    await sale.destroy({ transaction });
    await transaction.commit();

    res.json({ message: 'Sale deleted and stock restored successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
