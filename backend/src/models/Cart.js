class Cart {
  static items = [
    { id: 'cart-1', userId: 'user-1', productId: 'prod-4', name: 'Sony WH-1000XM5 Headphones', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200', variant: 'Black', price: 279, originalPrice: 399, quantity: 1 },
    { id: 'cart-2', userId: 'user-1', productId: 'prod-5', name: 'Nike Air Max 270', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200', variant: 'Black/White / US 10', price: 119, originalPrice: 150, quantity: 1 },
    { id: 'cart-3', userId: 'user-1', productId: 'prod-13', name: 'Ceramic Pour-Over Coffee Set', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200', variant: 'Matte Black', price: 45, originalPrice: 65, quantity: 2 }
  ];

  static getByUser(userId) { return this.items.filter(i => i.userId === userId); }

  static addItem(userId, item) {
    const existing = this.items.find(i => i.userId === userId && i.productId === item.productId && i.variant === item.variant);
    if (existing) { existing.quantity += item.quantity || 1; return existing; }
    const newItem = { id: `cart-${Date.now()}`, userId, ...item, quantity: item.quantity || 1 };
    this.items.push(newItem);
    return newItem;
  }

  static updateQuantity(itemId, quantity) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return null;
    item.quantity = quantity;
    return item;
  }

  static removeItem(itemId) {
    const idx = this.items.findIndex(i => i.id === itemId);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }

  static clear(userId) {
    this.items = this.items.filter(i => i.userId !== userId);
  }

  static getCount(userId) { return this.items.filter(i => i.userId === userId).reduce((sum, i) => sum + i.quantity, 0); }
}

module.exports = Cart;
