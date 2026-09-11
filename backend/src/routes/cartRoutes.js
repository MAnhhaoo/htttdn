const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get cart items
 *     responses:
 *       200:
 *         description: Cart items
 */
router.get('/', (req, res) => {
  const userId = req.query.userId || 'user-1';
  const items = Cart.getByUser(userId);
  const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const originalTotal = items.reduce((sum, i) => sum + (i.originalPrice * i.quantity), 0);
  res.json({ success: true, data: { items, count: Cart.getCount(userId), subtotal, discount: originalTotal - subtotal, shippingFee: subtotal >= 50 ? 0 : 5.99, total: subtotal >= 50 ? subtotal : subtotal + 5.99 } });
});

/**
 * @swagger
 * /api/cart:
 *   post:
 *     tags: [Cart]
 *     summary: Add item to cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId: { type: string }
 *               name: { type: string }
 *               image: { type: string }
 *               variant: { type: string }
 *               price: { type: number }
 *               originalPrice: { type: number }
 *               quantity: { type: integer }
 *     responses:
 *       201:
 *         description: Item added
 */
router.post('/', (req, res) => {
  const userId = req.body.userId || 'user-1';
  const item = Cart.addItem(userId, req.body);
  res.status(201).json({ success: true, data: item });
});

/**
 * @swagger
 * /api/cart/{itemId}:
 *   put:
 *     tags: [Cart]
 *     summary: Update item quantity
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity: { type: integer }
 *     responses:
 *       200:
 *         description: Item updated
 */
router.put('/:itemId', (req, res) => {
  const item = Cart.updateQuantity(req.params.itemId, req.body.quantity);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  res.json({ success: true, data: item });
});

/**
 * @swagger
 * /api/cart/{itemId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item from cart
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item removed
 */
router.delete('/:itemId', (req, res) => {
  const removed = Cart.removeItem(req.params.itemId);
  if (!removed) return res.status(404).json({ success: false, message: 'Item not found' });
  res.json({ success: true, message: 'Item removed' });
});

module.exports = router;
