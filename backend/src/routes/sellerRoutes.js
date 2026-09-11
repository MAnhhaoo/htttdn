const express = require('express');
const router = express.Router();
const sellers = require('../data/sellers.json');
const Product = require('../models/Product');

/** @swagger
 * /api/sellers/{id}:
 *   get:
 *     tags: [Sellers]
 *     summary: Get seller storefront
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Seller storefront */
router.get('/:id', (req, res) => {
  const seller = sellers.find(s => s.id === req.params.id || s.slug === req.params.id);
  if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
  const products = Product.findBySeller(seller.id);
  res.json({ success: true, data: { ...seller, products, totalProducts: products.length } });
});

module.exports = router;
