import { useState, useEffect } from 'react';
import { Search, Eye, Loader2 } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatHelpers';
import { Button, Select, Badge } from '../../components/ui';
import OrderDetailModal from './OrderDetailModal';

export default function OrderManagement() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [orderToView, setOrderToView] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getVendorOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter(o =>
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

  const handleViewClick = (order) => {
    setOrderToView(order);
    setIsDetailModalOpen(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Không thể cập nhật trạng thái đơn hàng. ' + (error.response?.data?.message || ''));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

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
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'processing', label: 'Processing' },
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
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Order Code</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Customer</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Your Items</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Subtotal</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">No orders found</td>
                </tr>
              ) : (
                filtered.map(order => {
                  const myItems = order.details.filter(od => od.productVariant?.productColor?.product?.vendorId === user?.id);
                  const subtotal = myItems.reduce((sum, od) => sum + od.price * od.quantity, 0);
                  return (
                    <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">#{order.orderCode}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{order.receiverName}</td>
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
                          <Button variant="ghost" size="sm" icon={Eye} className="text-slate-400 hover:text-indigo-600" onClick={() => handleViewClick(order)} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={orderToView}
        onStatusChange={(newStatus) => handleStatusChange(orderToView.id, newStatus)}
        vendorId={user?.id}
      />
    </div>
  );
}
