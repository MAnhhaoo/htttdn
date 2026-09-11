const categories = require('../data/categories.json');

class Category {
  static data = [...categories];

  static findAll() {
    return this.data;
  }

  static findBySlug(slug) {
    return this.data.find(c => c.slug === slug);
  }

  static findById(id) {
    return this.data.find(c => c.id === id);
  }
}

module.exports = Category;
