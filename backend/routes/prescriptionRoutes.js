const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { validatePrescriptionPayload, getPaginationOptions } = require('../utils/validation');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { limit, offset } = getPaginationOptions(req.query);
    const where = req.user.role === 'customer' ? { userId: req.user.id } : undefined;
    const prescriptions = await Prescription.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prescriptions' });
  }
});

router.post('/', requireRole('admin', 'pharmacist'), async (req, res) => {
  const validation = validatePrescriptionPayload(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    const prescription = await Prescription.create({
      ...req.body,
      userId: req.body.userId || null,
    });
    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: 'Error creating prescription' });
  }
});

module.exports = router;
