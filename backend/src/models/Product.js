const products = require('../data/products.json');

class Product {
  static data = [...products];

  static findAll({ category, brand, minPrice, maxPrice, rating, discount, search, sort, page = 1, limit = 12, tags }) {
    let filtered = [...this.data];

    if (category) filtered = filtered.filter(p => p.categoryId === category || p.subcategoryId === category);
    if (brand) filtered = filtered.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));
    if (rating) filtered = filtered.filter(p => p.rating >= Number(rating));
    if (discount) filtered = filtered.filter(p => p.discount >= Number(discount));
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryId.toLowerCase().includes(q)
      );
    }
    if (tags) {
      const tagList = tags.split(',');
      filtered = filtered.filter(p => tagList.some(t => p.tags.includes(t)));
    }

    // Sorting
    switch (sort) {
      case 'price_asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price_desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      case 'newest': filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'popular': filtered.sort((a, b) => b.soldCount - a.soldCount); break;
      default: filtered.sort((a, b) => b.soldCount - a.soldCount);
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + Number(limit));

    return { items, total, page: Number(page), limit: Number(limit), totalPages };
  }

  static findById(id) {
    return this.data.find(p => p.id === id);
  }

  static findBySlug(slug) {
    return this.data.find(p => p.slug === slug);
  }

  static findTrending() {
    return this.data.filter(p => p.tags.includes('trending')).sort((a, b) => b.soldCount - a.soldCount);
  }

  static findBestSellers() {
    return [...this.data].sort((a, b) => b.soldCount - a.soldCount).slice(0, 10);
  }

  static findNewArrivals() {
    return [...this.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
  }

  static findFlashDeals() {
    return this.data.filter(p => p.tags.includes('flash-deal'));
  }

  static findPremium() {
    return this.data.filter(p => p.tags.includes('premium'));
  }

  static findFeatured() {
    return this.data.filter(p => p.featured);
  }

  static findSimilar(id) {
    const product = this.findById(id);
    if (!product) return [];
    return this.data.filter(p => p.id !== id && (p.categoryId === product.categoryId || p.brand === product.brand)).slice(0, 8);
  }

  static findByCategory(categoryId) {
    return this.data.filter(p => p.categoryId === categoryId);
  }

  static findBySeller(sellerId) {
    return this.data.filter(p => p.sellerId === sellerId);
  }

  static getBrands() {
    return [...new Set(this.data.map(p => p.brand))].sort();
  }
}

module.exports = Product;
