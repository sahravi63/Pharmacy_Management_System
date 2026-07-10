const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

router.use(authenticate, requireRole('admin', 'pharmacist'));

router.get('/', async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({ order: [['createdAt', 'DESC']] });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const prescription = await Prescription.create(req.body);
    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: 'Error creating prescription', error: error.message });
  }
});

module.exports = router;
