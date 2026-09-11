const express = require('express');
const router = express.Router();
const reviews = require('../data/reviews.json');

/** @swagger
 * /api/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews for a product
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product reviews */
router.get('/', (req, res) => {
  const productReviews = reviews.filter(r => r.productId === req.query.productId);
  const avgRating = productReviews.length ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1) : 0;
  const distribution = [5, 4, 3, 2, 1].map(star => ({ star, count: productReviews.filter(r => r.rating === star).length, percentage: productReviews.length ? Math.round((productReviews.filter(r => r.rating === star).length / productReviews.length) * 100) : 0 }));
  res.json({ success: true, data: { reviews: productReviews, total: productReviews.length, averageRating: Number(avgRating), distribution } });
});

/** @swagger
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Add a review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId: { type: string }
 *               rating: { type: integer }
 *               title: { type: string }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Review added */
router.post('/', (req, res) => {
  const review = { id: `rev-${Date.now()}`, ...req.body, userId: req.body.userId || 'user-1', userName: 'Alex J.', avatar: 'https://ui-avatars.com/api/?name=AJ&background=C9A84C&color=fff&size=40', verified: true, helpful: 0, images: req.body.images || [], createdAt: new Date().toISOString() };
  reviews.push(review);
  res.status(201).json({ success: true, data: review });
});

module.exports = router;
