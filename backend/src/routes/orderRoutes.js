const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: List user orders
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [all, to_pay, processing, shipping, delivered, cancelled, returned] }
 *     responses:
 *       200:
 *         description: Order list
 */
router.get('/', (req, res) => {
  const userId = req.query.userId || 'user-1';
  const orders = Order.findByUser(userId, req.query.status);
  res.json({ success: true, data: orders });
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order detail
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order detail
 */
router.get('/:id', (req, res) => {
  const order = Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Place a new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/', (req, res) => {
  const order = Order.create({ userId: req.body.userId || 'user-1', ...req.body });
  res.status(201).json({ success: true, data: order });
});

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   put:
 *     tags: [Orders]
 *     summary: Cancel an order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order cancelled
 */
router.put('/:id/cancel', (req, res) => {
  const order = Order.cancel(req.params.id);
  if (!order) return res.status(400).json({ success: false, message: 'Cannot cancel this order' });
  res.json({ success: true, data: order });
});

module.exports = router;
