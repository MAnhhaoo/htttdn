const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', (req, res) => {
  const user = User.findByEmail(req.body.email);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const { password, ...safeUser } = user;
  res.json({ success: true, data: { user: safeUser, token: 'mock-jwt-token-' + user.id } });
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Registration successful
 */
router.post('/register', (req, res) => {
  if (User.findByEmail(req.body.email)) return res.status(400).json({ success: false, message: 'Email already exists' });
  const newUser = { id: `user-${Date.now()}`, ...req.body, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.body.fullName)}&background=C9A84C&color=fff&size=120`, addresses: [], paymentMethods: [], createdAt: new Date().toISOString() };
  User.data.push(newUser);
  const { password, ...safeUser } = newUser;
  res.status(201).json({ success: true, data: { user: safeUser, token: 'mock-jwt-token-' + newUser.id } });
});

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get user profile
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/profile', (req, res) => {
  const user = User.findById(req.query.userId || 'user-1');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const { password, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', (req, res) => {
  const userId = req.body.userId || 'user-1';
  const user = User.updateProfile(userId, req.body);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const { password, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

module.exports = router;
