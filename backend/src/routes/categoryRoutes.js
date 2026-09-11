const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all categories
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', (req, res) => {
  res.json({ success: true, data: Category.findAll() });
});

/**
 * @swagger
 * /api/categories/{slug}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by slug with products
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category detail with products
 */
router.get('/:slug', (req, res) => {
  const category = Category.findBySlug(req.params.slug);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  const products = Product.findByCategory(category.id);
  res.json({ success: true, data: { ...category, products } });
});

module.exports = router;
