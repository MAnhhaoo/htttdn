const express = require('express');
const router = express.Router();
const notifications = require('../data/notifications.json');

/** @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
 *     responses:
 *       200:
 *         description: Notification list */
router.get('/', (req, res) => {
  const userId = req.query.userId || 'user-1';
  const userNotifs = notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const unreadCount = userNotifs.filter(n => !n.read).length;
  res.json({ success: true, data: { notifications: userNotifs, unreadCount } });
});

/** @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Marked as read */
router.put('/:id/read', (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
  notif.read = true;
  res.json({ success: true, data: notif });
});

module.exports = router;
