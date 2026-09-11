const express = require('express');
const router = express.Router();
const deals = require('../data/deals.json');
const Product = require('../models/Product');

/** @swagger
 * /api/deals:
 *   get:
 *     tags: [Deals]
 *     summary: Get all deals
 *     responses:
 *       200:
 *         description: All deals */
router.get('/', (req, res) => {
  const enriched = deals.filter(d => d.active).map(d => {
    const product = Product.findById(d.productId);
    return { ...d, product };
  });
  res.json({ success: true, data: enriched });
});

/** @swagger
 * /api/deals/flash-sale:
 *   get:
 *     tags: [Deals]
 *     summary: Get flash sale deals
 *     responses:
 *       200:
 *         description: Flash sale items */
router.get('/flash-sale', (req, res) => {
  const flash = deals.filter(d => d.type === 'flash_sale' && d.active).map(d => ({ ...d, product: Product.findById(d.productId) }));
  res.json({ success: true, data: flash });
});

/** @swagger
 * /api/deals/today:
 *   get:
 *     tags: [Deals]
 *     summary: Get today's deals
 *     responses:
 *       200:
 *         description: Today's deals */
router.get('/today', (req, res) => {
  const today = deals.filter(d => d.type === 'today_deal' && d.active).map(d => ({ ...d, product: Product.findById(d.productId) }));
  res.json({ success: true, data: today });
});

module.exports = router;
