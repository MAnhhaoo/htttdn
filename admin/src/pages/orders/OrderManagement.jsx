import { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { mockOrders, mockUsers, mockOrderDetails, mockProductVariants, mockProductColors, mockProducts } from '../../data';
import { formatCurrency, formatDate } from '../../utils/formatHelpers';
import { Button, Select, Badge } from '../../components/ui';
import OrderDetailModal from './OrderDetailModal';

export default function OrderManagement() {
  const [orders, setOrders] = useState(mockOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [orderToView, setOrderToView] = useState(null);

  const filtered = orders.filter(o => {
    const user = mockUsers.find(u => u.id === o.userId);
    const matchSearch = String(o.id).includes(search) ||
      (user?.fullName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
    setOrderToView({ ...order, userName });
    setIsDetailModalOpen(true);
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    // also update the order being viewed so the modal refreshes
    setOrderToView(prev => ({ ...prev, status: newStatus }));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Order Management</h1>
        <p className="text-slate-500 dark:text-slate-400">{filtered.length} orders</p>
      </div>

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 flex-1">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input type="text" placeholder="Search by order ID or customer..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
          <Select 
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'shipping', label: 'Shipping' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
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
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Items</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const user = mockUsers.find(u => u.id === order.userId);
                const userName = user?.fullName || 'Unknown';
                const details = mockOrderDetails.filter(od => od.orderId === order.id);
                return (
                  <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">#{order.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{userName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{details.length} item(s)</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusBadge(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" icon={Eye} className="text-slate-400 hover:text-blue-600" onClick={() => handleViewClick(order, userName)} />
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
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
