const orders = require('../data/orders.json');

class Order {
  static data = [...orders];

  static findByUser(userId, status) {
    let result = this.data.filter(o => o.userId === userId);
    if (status && status !== 'all') result = result.filter(o => o.status === status);
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static findById(id) { return this.data.find(o => o.id === id); }

  static create(orderData) {
    const order = { id: `order-${Date.now()}`, orderNumber: `MV-${new Date().getFullYear()}-${String(this.data.length + 1).padStart(6, '0')}`, status: 'to_pay', ...orderData, timeline: [{ status: 'Order Placed', date: new Date().toISOString(), completed: true }, { status: 'Processing', date: null, completed: false }, { status: 'Shipped', date: null, completed: false }, { status: 'Delivered', date: null, completed: false }], createdAt: new Date().toISOString() };
    this.data.push(order);
    return order;
  }

  static cancel(id) {
    const order = this.findById(id);
    if (!order || !['to_pay', 'processing'].includes(order.status)) return null;
    order.status = 'cancelled';
    order.timeline.push({ status: 'Cancelled', date: new Date().toISOString(), completed: true });
    return order;
  }
}

module.exports = Order;
