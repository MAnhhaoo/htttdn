const express = require('express');
const router = express.Router();
const User = require('../models/User');

/** @swagger
 * /api/addresses:
 *   get:
 *     tags: [Addresses]
 *     summary: List user addresses
 *     responses:
 *       200:
 *         description: Address list */
router.get('/', (req, res) => {
  res.json({ success: true, data: User.getAddresses(req.query.userId || 'user-1') });
});

/** @swagger
 * /api/addresses:
 *   post:
 *     tags: [Addresses]
 *     summary: Add new address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               phone: { type: string }
 *               province: { type: string }
 *               district: { type: string }
 *               ward: { type: string }
 *               detail: { type: string }
 *               isDefault: { type: boolean }
 *     responses:
 *       201:
 *         description: Address added */
router.post('/', (req, res) => {
  const addr = User.addAddress(req.body.userId || 'user-1', req.body);
  if (!addr) return res.status(404).json({ success: false, message: 'User not found' });
  res.status(201).json({ success: true, data: addr });
});

/** @swagger
 * /api/addresses/{id}:
 *   put:
 *     tags: [Addresses]
 *     summary: Update address
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Address updated */
router.put('/:id', (req, res) => {
  const addr = User.updateAddress(req.body.userId || 'user-1', req.params.id, req.body);
  if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
  res.json({ success: true, data: addr });
});

/** @swagger
 * /api/addresses/{id}:
 *   delete:
 *     tags: [Addresses]
 *     summary: Delete address
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Address deleted */
router.delete('/:id', (req, res) => {
  const deleted = User.deleteAddress(req.query.userId || 'user-1', req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Address not found' });
  res.json({ success: true, message: 'Address deleted' });
});

module.exports = router;
