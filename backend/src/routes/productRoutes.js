const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List products with filters and pagination
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: brand
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: rating
 *         schema: { type: number }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [popular, newest, price_asc, price_desc, rating] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: tags
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/', (req, res) => {
  const result = Product.findAll(req.query);
  res.json({ success: true, data: result });
});

/**
 * @swagger
 * /api/products/trending:
 *   get:
 *     tags: [Products]
 *     summary: Get trending products
 *     responses:
 *       200:
 *         description: Trending products
 */
router.get('/trending', (req, res) => {
  res.json({ success: true, data: Product.findTrending() });
});

/**
 * @swagger
 * /api/products/best-sellers:
 *   get:
 *     tags: [Products]
 *     summary: Get best selling products
 *     responses:
 *       200:
 *         description: Best sellers
 */
router.get('/best-sellers', (req, res) => {
  res.json({ success: true, data: Product.findBestSellers() });
});

/**
 * @swagger
 * /api/products/new-arrivals:
 *   get:
 *     tags: [Products]
 *     summary: Get newest products
 *     responses:
 *       200:
 *         description: New arrivals
 */
router.get('/new-arrivals', (req, res) => {
  res.json({ success: true, data: Product.findNewArrivals() });
});

/**
 * @swagger
 * /api/products/flash-deals:
 *   get:
 *     tags: [Products]
 *     summary: Get flash deal products
 *     responses:
 *       200:
 *         description: Flash deals
 */
router.get('/flash-deals', (req, res) => {
  res.json({ success: true, data: Product.findFlashDeals() });
});

/**
 * @swagger
 * /api/products/premium:
 *   get:
 *     tags: [Products]
 *     summary: Get premium collection
 *     responses:
 *       200:
 *         description: Premium products
 */
router.get('/premium', (req, res) => {
  res.json({ success: true, data: Product.findPremium() });
});

/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     tags: [Products]
 *     summary: Get featured products
 *     responses:
 *       200:
 *         description: Featured products
 */
router.get('/featured', (req, res) => {
  res.json({ success: true, data: Product.findFeatured() });
});

/**
 * @swagger
 * /api/products/brands:
 *   get:
 *     tags: [Products]
 *     summary: Get all brands
 *     responses:
 *       200:
 *         description: List of brands
 */
router.get('/brands', (req, res) => {
  res.json({ success: true, data: Product.getBrands() });
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product detail
 *       404:
 *         description: Product not found
 */
router.get('/:id', (req, res) => {
  const product = Product.findById(req.params.id) || Product.findBySlug(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
});

/**
 * @swagger
 * /api/products/{id}/similar:
 *   get:
 *     tags: [Products]
 *     summary: Get similar products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Similar products
 */
router.get('/:id/similar', (req, res) => {
  res.json({ success: true, data: Product.findSimilar(req.params.id) });
});

module.exports = router;
