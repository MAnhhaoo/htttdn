const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * @swagger
 * /api/search:
 *   get:
 *     tags: [Search]
 *     summary: Search products
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/', (req, res) => {
  const { q, ...rest } = req.query;
  const result = Product.findAll({ search: q, ...rest });
  res.json({ success: true, data: { query: q, ...result } });
});

/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     tags: [Search]
 *     summary: Get search suggestions
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Search suggestions
 */
router.get('/suggestions', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const products = Product.findAll({ search: q, limit: 5 }).items;
  const brands = Product.getBrands().filter(b => b.toLowerCase().includes(q)).slice(0, 3);
  const categories = require('../models/Category').findAll().filter(c => c.name.toLowerCase().includes(q)).slice(0, 3);
  res.json({ success: true, data: { products: products.map(p => ({ id: p.id, name: p.name, image: p.images[0], price: p.price })), brands, categories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })) } });
});

/**
 * @swagger
 * /api/search/popular:
 *   get:
 *     tags: [Search]
 *     summary: Get popular searches
 *     responses:
 *       200:
 *         description: Popular search terms
 */
router.get('/popular', (req, res) => {
  res.json({ success: true, data: ['iPhone', 'MacBook', 'Nike', 'Headphones', 'Watch', 'Skincare', 'Sofa', 'AirPods', 'Samsung', 'Coffee'] });
});

module.exports = router;
