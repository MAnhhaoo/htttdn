class Wishlist {
  static items = [
    { id: 'wish-1', userId: 'user-1', productId: 'prod-3', addedAt: '2024-10-10T08:00:00Z' },
    { id: 'wish-2', userId: 'user-1', productId: 'prod-6', addedAt: '2024-10-15T12:00:00Z' },
    { id: 'wish-3', userId: 'user-1', productId: 'prod-7', addedAt: '2024-10-18T09:00:00Z' },
    { id: 'wish-4', userId: 'user-1', productId: 'prod-16', addedAt: '2024-10-20T16:00:00Z' }
  ];

  static getByUser(userId) { return this.items.filter(i => i.userId === userId); }

  static add(userId, productId) {
    const existing = this.items.find(i => i.userId === userId && i.productId === productId);
    if (existing) return existing;
    const item = { id: `wish-${Date.now()}`, userId, productId, addedAt: new Date().toISOString() };
    this.items.push(item);
    return item;
  }

  static remove(userId, productId) {
    const idx = this.items.findIndex(i => i.userId === userId && i.productId === productId);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }

  static isInWishlist(userId, productId) {
    return this.items.some(i => i.userId === userId && i.productId === productId);
  }

  static getCount(userId) { return this.items.filter(i => i.userId === userId).length; }
}

module.exports = Wishlist;
