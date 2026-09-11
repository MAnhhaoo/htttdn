const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Miva E-commerce API',
      version: '1.0.0',
      description: 'RESTful API for Miva — Everything You Need. A modern premium e-commerce marketplace.',
      contact: { name: 'Miva Team', email: 'api@miva.com' },
      license: { name: 'MIT' }
    },
    servers: [{ url: 'http://localhost:5000', description: 'Development server' }],
    tags: [
      { name: 'Products', description: 'Product management' },
      { name: 'Categories', description: 'Category management' },
      { name: 'Search', description: 'Search & suggestions' },
      { name: 'Cart', description: 'Shopping cart operations' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Auth', description: 'Authentication' },
      { name: 'Users', description: 'User profile management' },
      { name: 'Wishlist', description: 'Wishlist operations' },
      { name: 'Addresses', description: 'Address management' },
      { name: 'Vouchers', description: 'Voucher/coupon management' },
      { name: 'Reviews', description: 'Product reviews' },
      { name: 'Sellers', description: 'Seller storefronts' },
      { name: 'Deals', description: 'Deals & promotions' },
      { name: 'Notifications', description: 'User notifications' }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
