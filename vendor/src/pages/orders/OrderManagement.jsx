import { useState } from 'react';
import { Search, Eye, Edit } from 'lucide-react';
import { mockOrders, mockOrderDetails, mockProductVariants, mockProductColors, mockProducts, mockUsers, mockVendorProductMappings } from '../../data';
import { formatCurrency, formatDate } from '../../utils/formatHelpers';
import { Button, Select, Badge } from '../../components/ui';
import OrderDetailModal from './OrderDetailModal';

const CURRENT_VENDOR_ID = 3;

export default function OrderManagement() {
  const vendorProductIds = mockVendorProductMappings
    .filter(m => m.vendorId === CURRENT_VENDOR_ID)
    .map(m => m.productId);

  const vendorColorIds = mockProductColors
    .filter(c => vendorProductIds.includes(c.productId))
    .map(c => c.id);

  const vendorVariantIds = mockProductVariants
    .filter(v => vendorColorIds.includes(v.productColorId))
    .map(v => v.id);

  const vendorOrderDetails = mockOrderDetails.filter(od => vendorVariantIds.includes(od.productVariantId));
  const vendorOrderIds = [...new Set(vendorOrderDetails.map(od => od.orderId))];
  const vendorOrders = mockOrders.filter(o => vendorOrderIds.includes(o.id));

  const [statusFilter, setStatusFilter] = useState('all');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [orderToView, setOrderToView] = useState(null);

  const filtered = vendorOrders.filter(o =>
    statusFilter === 'all' || o.status === statusFilter
  );

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'success',
      pending: 'warning',
      shipping: 'info',
      cancelled: 'error',
    };
    return styles[status] || 'default';
  };

  const handleViewClick = (order, userName) => {
    // In Vendor, we should ideally filter the order items to ONLY show items belonging to this vendor
    // But for simplicity in the mock, we pass the order. The Modal will show it.
    setOrderToView({ ...order, userName });
    setIsDetailModalOpen(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Orders</h1>
        <p className="text-slate-500 dark:text-slate-400">{filtered.length} orders containing your products</p>
      </div>

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <Select 
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'shipping', label: 'Shipping' },
              { value: 'completed', label: 'Completed' }
            ]}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-48"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Order ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Customer</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Your Items</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Subtotal</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const user = mockUsers.find(u => u.id === order.userId);
                const userName = user?.fullName || 'Unknown';
                const myItems = vendorOrderDetails.filter(od => od.orderId === order.id);
                const subtotal = myItems.reduce((sum, od) => sum + od.price * od.quantity, 0);
                return (
                  <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">#{order.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{userName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{myItems.length} item(s)</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">{formatCurrency(subtotal)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusBadge(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" icon={Eye} className="text-slate-400 hover:text-indigo-600" onClick={() => handleViewClick(order, userName)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={orderToView}
        // Note: Vendor is usually not able to modify the overall order status if there are multiple vendors,
        // but for simplicity in this mock, we can leave onStatusChange undefined or let them update it.
      />
    </div>
  );
}
