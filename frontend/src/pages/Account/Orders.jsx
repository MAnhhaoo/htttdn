import { Package } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { formatPrice } from '../../utils/formatPrice';

// Mock Orders
const mockOrders = [
  {
    id: 'ORD-739218',
    date: '2026-09-10',
    status: 'Delivered',
    total: 3500000,
    items: [
      { name: 'Premium Wireless Headphones', qty: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' }
    ]
  },
  {
    id: 'ORD-928374',
    date: '2026-09-12',
    status: 'Processing',
    total: 1250000,
    items: [
      { name: 'Minimalist Watch', qty: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80' },
      { name: 'Leather Wallet', qty: 1, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80' }
    ]
  }
];

export default function Orders() {
  
  if (mockOrders.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-sm h-full flex flex-col">
        <div className="p-6 md:p-8 border-b border-light-border dark:border-dark-border">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">My Orders</h2>
        </div>
        <div className="flex-1 flex items-center justify-center py-20">
          <EmptyState 
            icon={Package}
            title="No orders yet"
            description="Looks like you haven't made any purchases yet."
            actionText="Start Shopping"
          />
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'processing': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">My Orders</h2>
      <p className="text-light-muted dark:text-dark-muted mb-8">View and track your recent orders.</p>

      <div className="space-y-6">
        {mockOrders.map(order => (
          <div key={order.id} className="border border-light-border dark:border-dark-border rounded-xl overflow-hidden">
            
            {/* Order Header */}
            <div className="bg-gray-50 dark:bg-dark-bg/50 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border">
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <div>
                  <p className="text-light-muted dark:text-dark-muted mb-1">Order Number</p>
                  <p className="font-bold text-light-text dark:text-dark-text">{order.id}</p>
                </div>
                <div>
                  <p className="text-light-muted dark:text-dark-muted mb-1">Date Placed</p>
                  <p className="font-semibold text-light-text dark:text-dark-text">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-light-muted dark:text-dark-muted mb-1">Total Amount</p>
                  <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                </div>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-4 md:p-6 divide-y divide-light-border dark:divide-dark-border">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-light-text dark:text-dark-text line-clamp-1">{item.name}</h4>
                    <p className="text-sm text-light-muted dark:text-dark-muted mt-1">Qty: {item.qty}</p>
                  </div>
                  <button className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
                    View Product
                  </button>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
