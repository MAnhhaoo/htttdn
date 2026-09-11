const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     tags: [Wishlist]
 *     summary: Get wishlist items
 *     responses:
 *       200:
 *         description: Wishlist items with product details
 */
router.get('/', (req, res) => {
  const userId = req.query.userId || 'user-1';
  const items = Wishlist.getByUser(userId);
  const products = items.map(i => {
    const p = Product.findById(i.productId);
    return p ? { ...i, product: p } : null;
  }).filter(Boolean);
  res.json({ success: true, data: { items: products, count: Wishlist.getCount(userId) } });
});

/**
 * @swagger
 * /api/wishlist:
 *   post:
 *     tags: [Wishlist]
 *     summary: Add to wishlist
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId: { type: string }
 *     responses:
 *       201:
 *         description: Added to wishlist
 */
router.post('/', (req, res) => {
  const item = Wishlist.add(req.body.userId || 'user-1', req.body.productId);
  res.status(201).json({ success: true, data: item });
});

/**
 * @swagger
 * /api/wishlist/{productId}:
 *   delete:
 *     tags: [Wishlist]
 *     summary: Remove from wishlist
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Removed from wishlist
 */
router.delete('/:productId', (req, res) => {
  Wishlist.remove(req.query.userId || 'user-1', req.params.productId);
  res.json({ success: true, message: 'Removed from wishlist' });
});

module.exports = router;
