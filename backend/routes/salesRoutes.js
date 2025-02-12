const express = require('express');
const { Sales, SalesItems } = require('../models/sales');
const router = express.Router();

// @route    POST /sales
// @desc     Create a new sale
router.post('/', async (req, res) => {
  const { date, customerName, totalAmount, itemsSold } = req.body;

  try {
    const newSale = await Sales.create({
      date,
      customerName,
      totalAmount,
    });

    // Create items associated with the sale
    const itemsPromises = itemsSold.map(item => SalesItems.create({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      saleId: newSale.id, // Foreign key for association
    }));

    await Promise.all(itemsPromises);

    res.status(201).json(newSale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// @route    GET /sales
// @desc     Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sales.findAll({
      include: [{ model: SalesItems, as: 'itemsSold' }],
    });

    res.json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// @route    GET /sales/:id
// @desc     Get a sale by ID
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sales.findByPk(req.params.id, {
      include: [{ model: SalesItems, as: 'itemsSold' }],
    });

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// @route    PUT /sales/:id
// @desc     Update a sale by ID
router.put('/:id', async (req, res) => {
  const { date, customerName, totalAmount, itemsSold } = req.body;

  try {
    const sale = await Sales.findByPk(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    sale.date = date || sale.date;
    sale.customerName = customerName || sale.customerName;
    sale.totalAmount = totalAmount || sale.totalAmount;

    await sale.save();

    // Update associated items (for simplicity, delete existing and re-create)
    await SalesItems.destroy({ where: { saleId: sale.id } });
    const itemsPromises = itemsSold.map(item => SalesItems.create({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      saleId: sale.id,
    }));

    await Promise.all(itemsPromises);

    res.json(sale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// @route    DELETE /sales/:id
// @desc     Delete a sale by ID
router.delete('/:id', async (req, res) => {
  try {
    const sale = await Sales.findByPk(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    await SalesItems.destroy({ where: { saleId: sale.id } });
    await sale.destroy();

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
