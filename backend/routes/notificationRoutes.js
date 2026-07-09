const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { checkInventoryAlerts } = require('../services/notificationService');

router.use(authenticate, requireRole('admin', 'pharmacist'));

router.get('/', async (req, res) => {
  try {
    const where = req.query.unreadOnly === 'true' ? { read: false } : {};
    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(req.query.limit) || 100,
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

router.post('/inventory-check', async (req, res) => {
  try {
    const result = await checkInventoryAlerts();
    res.json({
      message: 'Inventory check completed',
      lowStockCount: result.lowStock.length,
      expiringSoonCount: result.expiringSoon.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Inventory check failed', error: error.message });
  }
});

router.patch('/read-all', async (req, res) => {
  try {
    await Notification.update({ read: true }, { where: { read: false } });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications', error: error.message });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    await notification.destroy();
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
});

module.exports = router;
