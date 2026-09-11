const express = require('express');
const router = express.Router();
const vouchers = require('../data/vouchers.json');

/** @swagger
 * /api/vouchers:
 *   get:
 *     tags: [Vouchers]
 *     summary: List available vouchers
 *     responses:
 *       200:
 *         description: Voucher list */
router.get('/', (req, res) => {
  res.json({ success: true, data: vouchers.filter(v => v.active) });
});

/** @swagger
 * /api/vouchers/apply:
 *   post:
 *     tags: [Vouchers]
 *     summary: Apply voucher code
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code: { type: string }
 *               orderTotal: { type: number }
 *     responses:
 *       200:
 *         description: Voucher applied */
router.post('/apply', (req, res) => {
  const { code, orderTotal } = req.body;
  const voucher = vouchers.find(v => v.code === code && v.active);
  if (!voucher) return res.status(404).json({ success: false, message: 'Invalid voucher code' });
  if (new Date(voucher.expiresAt) < new Date()) return res.status(400).json({ success: false, message: 'Voucher has expired' });
  if (orderTotal < voucher.minOrder) return res.status(400).json({ success: false, message: `Minimum order of $${voucher.minOrder} required` });
  let discount = voucher.type === 'percentage' ? Math.min((orderTotal * voucher.discount) / 100, voucher.maxDiscount) : voucher.discount;
  res.json({ success: true, data: { voucher, discount: Math.round(discount * 100) / 100 } });
});

module.exports = router;
