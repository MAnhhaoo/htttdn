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
  const [searchTerm, setSearchTerm] = useState('');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [orderToView, setOrderToView] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getVendorOrders();
      setOrders(Array.isArray(data) ? data : (data?.list || []));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    if (!matchStatus) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().replace(/^#/, '').trim();
    const voCode = (o.vendorOrder?.vendorOrderCode || '').toLowerCase();
    const orderCode = (o.orderCode || '').toLowerCase();
    const matchProducts = (o.details || []).some(od => {
      const pName = od.productName || od.productVariant?.productColor?.product?.name || '';
      return pName.toLowerCase().includes(q);
    });
    return voCode.includes(q) || orderCode.includes(q) || matchProducts;
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
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quản lý Đơn hàng (My Orders)</h1>
        <p className="text-slate-500 dark:text-slate-400">{filtered.length} đơn hàng chứa sản phẩm của shop</p>
      </div>

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã đơn (#...), mã kiện (VO-...), hoặc tên sản phẩm..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <Select 
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'pending', label: 'Chờ xác nhận (Pending)' },
              { value: 'confirmed', label: 'Đã xác nhận (Confirmed)' },
              { value: 'processing', label: 'Đang xử lý (Processing)' },
              { value: 'shipping', label: 'Đang giao (Shipping)' },
              { value: 'completed', label: 'Hoàn thành (Completed)' },
              { value: 'cancelled', label: 'Đã hủy (Cancelled)' }
            ]}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-56"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Mã Đơn & Mã Kiện</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Khách Hàng (Bảo mật)</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Sản phẩm của Shop</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tổng tiền</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ngày tạo</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">Không tìm thấy đơn hàng nào</td>
                </tr>
              ) : (
                filtered.map(order => {
                  const myItems = order.details.filter(od => od.productVariant?.productColor?.product?.vendorId === user?.id);
                  const subtotal = myItems.reduce((sum, od) => sum + od.price * od.quantity, 0);
                  const voCode = order.vendorOrder?.vendorOrderCode || `VO-${order.orderCode?.slice(-6)}`;
                  return (
                    <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                          #{order.orderCode}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Kiện: <span className="text-slate-600 dark:text-slate-300">{voCode}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">Khách hàng MIVA</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{myItems.length} sản phẩm</td>
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
