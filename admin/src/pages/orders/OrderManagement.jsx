import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Eye, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  UserCheck,
  Sparkles,
  Clock
} from 'lucide-react';
import { ordersApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/formatHelpers';
import { Button, Select, Badge } from '../../components/ui';
import OrderDetailModal from './OrderDetailModal';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [autoAssigningAll, setAutoAssigningAll] = useState(false);
  
  // Server-side pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [orderToView, setOrderToView] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getOrders({ 
        page, 
        itemPerPage: itemsPerPage,
        search: search.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      const data = res.data;
      setOrders(data.list || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, itemsPerPage, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    window.addEventListener('miva:orders', fetchOrders);
    return () => window.removeEventListener('miva:orders', fetchOrders);
  }, [fetchOrders]);

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

  const handleStatusChange = async (orderId, newStatus, note) => {
    try {
      await ordersApi.updateOrderStatus(orderId, newStatus, note);
      // Re-fetch orders to sync all relationships (statusHistory, payment, vendorOrders, etc.)
      await fetchOrders();
      setOrderToView(prev => (prev && prev.id === orderId ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật trạng thái đơn hàng thất bại');
    }
  };

  const handleAutoAssignAll = async () => {
    if (!confirm('Hệ thống sẽ tự động quét và phân công các đơn hàng / kiện hàng chưa có người phụ trách theo mức cân bằng tải. Tiếp tục?')) return;
    try {
      setAutoAssigningAll(true);
      const res = await ordersApi.autoAssignAll();
      alert(res.data?.message || 'Tự động phân công hoàn tất!');
      await fetchOrders();
    } catch (err) {
      alert(`Lỗi tự động phân công: ${err.response?.data?.message || err.message}`);
    } finally {
      setAutoAssigningAll(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quản lý đơn hàng</h1>
          <p className="text-slate-500 dark:text-slate-400">{totalItems} đơn hàng trong hệ thống</p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Hệ thống tự động phân công nhân sự khi phát sinh đơn hàng</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 flex-1">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Tìm theo mã đơn (#...), tên khách hàng, số điện thoại, hoặc tên sản phẩm..." 
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none outline-none text-sm w-full text-slate-800 dark:text-slate-100" 
            />
          </div>
          <Select 
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'pending', label: 'Chờ xử lý (Pending)' },
              { value: 'confirmed', label: 'Đã xác nhận (Confirmed)' },
              { value: 'processing', label: 'Vendor đang xử lý (Processing)' },
              { value: 'shipping', label: 'Đang vận chuyển (Shipping)' },
              { value: 'completed', label: 'Hoàn tất (Completed)' },
              { value: 'cancelled', label: 'Đã hủy (Cancelled)' }
            ]}
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-56"
          />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex items-center justify-center py-20">
               <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
               <span className="ml-2 text-slate-500">Đang tải...</span>
             </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
              Không tìm thấy đơn hàng nào.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Mã đơn</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Khách hàng</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Số SP</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tổng tiền</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Nhân viên phụ trách</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ngày tạo</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const userName = order.client?.fullName || order.receiverName || order.user?.fullName || 'Khách hàng';
                  const userEmail = order.client?.email || '';
                  const itemsCount = order.details ? order.details.length : 0;
                  const displayOrderCode = order.orderCode ? `#${order.orderCode}` : `#${order.id.substring(0, 8)}...`;
                  const carrier = order.shipments?.find(s => s.carrier)?.carrier;

                  return (
                    <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-bold text-blue-600 dark:text-blue-400" title={order.orderCode || order.id}>
                        {displayOrderCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        <div className="font-medium text-slate-800 dark:text-slate-100">{userName}</div>
                        {userEmail && <div className="text-xs text-slate-400 dark:text-slate-500">{userEmail}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{itemsCount} SP</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusBadge(order.status)}>
                          {order.status.toUpperCase()}
                        </Badge>
                      </td>

                      {/* Assigned Employee Column */}
                      <td className="px-4 py-3 text-xs">
                        {carrier ? (
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{carrier.fullName}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {carrier.employeeCode} {carrier.phone ? `• ${carrier.phone}` : ''}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleViewClick(order, userName)}
                            className="text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1 border border-amber-200 dark:border-amber-900 transition"
                            title="Bấm để phân công nhân viên xử lý"
                          >
                            <Clock className="w-3 h-3 text-amber-600" /> Chưa phân công
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            icon={Eye} 
                            className="text-slate-400 hover:text-blue-600" 
                            onClick={() => handleViewClick(order, userName)}
                            title="Xem chi tiết & Điều phối đơn"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Server Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Trang {page} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                icon={ChevronLeft} 
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              />
              <Button 
                variant="outline" 
                size="sm" 
                icon={ChevronRight}
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              />
            </div>
          </div>
        )}
      </div>

      {isDetailModalOpen && (
        <OrderDetailModal 
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          order={orderToView}
          onStatusChange={handleStatusChange}
          onOrderUpdated={(updated) => {
            setOrderToView(updated);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
