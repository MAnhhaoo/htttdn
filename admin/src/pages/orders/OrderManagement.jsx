import { useState, useMemo, Fragment } from 'react';
import { 
  Search, 
  Eye, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Truck,
  Package,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Tag,
  Layers,
  X
} from 'lucide-react';
import { ordersApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/formatHelpers';
import {
  extractOrderEmployees,
  groupOrdersByCheckoutBatch,
  getOrderStatusBadgeVariant,
} from '../../utils/orderHelpers';
import { usePaginatedCacheList } from '../../hooks/usePaginatedCacheList';
import { Button, Select, Badge } from '../../components/ui';
import OrderDetailModal from './OrderDetailModal';

export default function OrderManagement() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [orderToView, setOrderToView] = useState(null);

  const extraParams = useMemo(
    () => (statusFilter === 'all' ? {} : { status: statusFilter }),
    [statusFilter]
  );

  // [YÊU CẦU 3 & 4 - ĐỌC DANH SÁCH HÓA ĐƠN & TÁI SỬ DỤNG BỘ NHỚ ĐỆM DÙNG CHUNG]:
  const {
    list: orders,
    search,
    setSearch,
    loading,
    page,
    setPage,
    totalPages,
    totalItems,
    reusedFromCache,
    fetchList: fetchOrders,
    handleResetAndReuseList: resetPaginatedList,
  } = usePaginatedCacheList({
    fetcher: ordersApi.getOrders,
    itemsPerPage: 10,
    extraParams,
    isDefaultExtraParams: statusFilter === 'all',
    realtimeEvent: 'miva:orders',
  });

  const handleResetAndReuseList = () => {
    resetPaginatedList(() => setStatusFilter('all'));
  };

  // Gộp các đơn hàng cùng 1 lượt checkout của cùng khách hàng thành 1 dòng hiển thị
  const groupedOrders = useMemo(() => groupOrdersByCheckoutBatch(orders), [orders]);

  const getStatusBadge = getOrderStatusBadgeVariant;

  const handleViewClick = (order, userName) => {
    setOrderToView({ ...order, userName });
    setIsDetailModalOpen(true);
  };

  const handleAutoAssignSingle = async (e, orderId) => {
    e.stopPropagation();
    try {
      await ordersApi.autoAssignOrder(orderId);
      await fetchOrders(true);
    } catch (err) {
      alert(`Lỗi tự động phân công: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleStatusChange = async (orderId, newStatus, note) => {
    try {
      await ordersApi.updateOrderStatus(orderId, newStatus, note);
      await fetchOrders(true);
      setOrderToView((prev) => {
        if (!prev) return prev;
        const updatedSubs = (prev.subOrders || [prev]).map((so) =>
          so.id === orderId ? { ...so, status: newStatus } : so
        );
        return {
          ...prev,
          status: prev.id === orderId ? newStatus : prev.status,
          subOrders: updatedSubs,
        };
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật trạng thái đơn hàng thất bại');
    }
  };

  const isFiltered = Boolean(search.trim() || statusFilter !== 'all' || page !== 1);

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quản lý đơn hàng &amp; Hóa đơn</h1>
            {reusedFromCache && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800">
                ⚡ Tái sử dụng DS gốc (Cache)
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            {totalItems} hóa đơn trong hệ thống • Tự động gộp các đơn cùng lượt đặt và tách chi tiết từng đơn khi bấm xem
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAndReuseList}
              className="flex items-center gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
              title="Khôi phục danh sách gốc từ bộ nhớ đệm mà không cần truy vấn lại CSDL"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Bỏ tìm kiếm (Dùng lại DS gốc)
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(true)}
            className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200"
            title="Chủ động đọc lại danh sách mới nhất từ CSDL PostgreSQL"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Tải lại từ CSDL
          </Button>
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
                const val = e.target.value;
                setSearch(val);
                setPage(1);
                if (!val.trim() && statusFilter === 'all' && defaultListCacheRef.current) {
                  setDebouncedSearch('');
                }
              }}
              className="bg-transparent border-none outline-none text-sm w-full text-slate-800 dark:text-slate-100" 
            />
            {search && (
              <button
                type="button"
                onClick={handleResetAndReuseList}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"
                title="Xóa tìm kiếm và dùng lại danh sách đã tải"
              >
                <X className="w-4 h-4" />
              </button>
            )}
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
          ) : groupedOrders.length === 0 ? (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
              Không tìm thấy đơn hàng nào.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Mã HĐ</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Khách hàng</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-center">Số lượng</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Tạm tính</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Khuyến mãi</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Tổng cộng</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Nhân viên phụ trách</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ngày tạo</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {groupedOrders.map(order => {
                  const subOrders = order.subOrders || [order];
                  const isMerged = subOrders.length > 1;
                  const userName = order.client?.fullName || order.receiverName || order.user?.fullName || 'Khách hàng';
                  const userEmail = order.client?.email || order.receiverPhone || '';
                  const detailsList = order.details || [];
                  const itemsCount = detailsList.length;
                  const totalQty = detailsList.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                  const subtotal = Number(order.subtotalAmount || order.totalAmount || 0);
                  const discount = Number(order.discountAmount || 0);
                  const voucherDetails = order.voucherDetails || [];
                  const displayOrderCode = order.orderCode ? `#${order.orderCode}` : `#${order.id}`;
                  const isExpanded = expandedOrderId === order.id;

                  const { displayEmp, shippingEmp, deptMeta } = extractOrderEmployees(order);
                  const uniqueStatuses = Array.from(new Set(subOrders.map((so) => so.status)));

                  return (
                    <Fragment key={order.id}>
                      <tr
                        onClick={() => setExpandedOrderId(prev => (prev === order.id ? null : order.id))}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 text-sm font-mono font-bold text-blue-600 dark:text-blue-400" title={order.orderCode || order.id}>
                          <div>{displayOrderCode}</div>
                          {isMerged && (
                            <div className="mt-1 flex flex-wrap items-center gap-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800">
                                <Layers className="w-3 h-3" />
                                Gộp {subOrders.length} đơn hàng
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          <div className="font-medium text-slate-800 dark:text-slate-100">{userName}</div>
                          {userEmail && <div className="text-xs text-slate-400 dark:text-slate-500">{userEmail}</div>}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{totalQty}</span>
                          <span className="text-xs text-slate-400 block">
                            ({itemsCount} mặt hàng{isMerged ? ` • ${subOrders.length} đơn` : ''})
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-300">
                          {formatCurrency(subtotal)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {discount > 0 ? (
                            <div>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                -{formatCurrency(discount)}
                              </span>
                              {voucherDetails.length > 0 && (
                                <div className="flex flex-wrap justify-end gap-1 mt-0.5">
                                  {voucherDetails.map((vd, vIdx) => (
                                    <span
                                      key={vd.id || vIdx}
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono"
                                    >
                                      <Tag className="w-2.5 h-2.5" />
                                      {vd.voucher?.code || 'VOUCHER'}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {uniqueStatuses.map((st) => (
                              <Badge key={st} variant={getStatusBadge(st)}>
                                {st.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </td>

                        {/* Assigned Employee Column */}
                        <td className="px-4 py-3 text-xs">
                          <div className="space-y-1">
                            {displayEmp && (
                              <div>
                                <div className={`font-semibold ${deptMeta.textColor} flex items-center gap-1.5`}>
                                  <deptMeta.icon className={`w-3.5 h-3.5 ${deptMeta.iconColor} shrink-0`} />
                                  <span className="truncate max-w-[130px]">{displayEmp.fullName}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                  {displayEmp.employeeCode} • {deptMeta.deptName}
                                </div>
                              </div>
                            )}

                            {shippingEmp && displayEmp?.id !== shippingEmp.id && (
                              <div className="pt-0.5 border-t border-slate-100 dark:border-slate-800">
                                <div className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 text-[11px]">
                                  <Truck className="w-3 h-3 text-blue-500 shrink-0" />
                                  <span className="truncate max-w-[130px]">Bưu tá: {shippingEmp.fullName}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {shippingEmp.employeeCode} • Vận chuyển &amp; Giao nhận
                                </div>
                              </div>
                            )}

                            {isMerged && (
                              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium pt-0.5">
                                + Nhân sự riêng theo {subOrders.length} đơn con
                              </div>
                            )}

                            {!displayEmp && !shippingEmp && (
                              <button
                                onClick={(e) => handleAutoAssignSingle(e, order.id)}
                                className="text-[11px] text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 transition shadow-xs"
                                title="Hệ thống tự động phân công nhân sự ngay"
                              >
                                <Sparkles className="w-3 h-3 text-blue-600 animate-spin" /> Tự động phân công
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={isExpanded ? ChevronUp : ChevronDown}
                              className="text-slate-400 hover:text-indigo-600"
                              onClick={() => setExpandedOrderId(prev => (prev === order.id ? null : order.id))}
                              title="Mở rộng / Thu gọn bảng chi tiết hóa đơn"
                            />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              icon={Eye} 
                              className="text-slate-400 hover:text-blue-600" 
                              onClick={() => handleViewClick(order, userName)}
                              title="Xem chi tiết đơn hàng & Điều phối"
                            />
                          </div>
                        </td>
                      </tr>

                      {/* [BẢNG CHI TIẾT HÓA ĐƠN MỞ RỘNG: NẾU GỘP 2 ĐƠN THÌ HIỂN THỊ CẢ 2 ĐƠN HÀNG RA RÕ RÀNG] */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                          <td colSpan={10} className="px-6 py-4">
                            <div className="space-y-4">
                              {isMerged && (
                                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs">
                                  <div className="font-bold text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-indigo-600" />
                                    Hóa đơn gộp gồm {subOrders.length} đơn hàng đặt cùng lượt ({formatDate(order.createdAt)})
                                  </div>
                                  <div className="flex flex-wrap items-center gap-4 text-slate-700 dark:text-slate-200">
                                    <span>Tổng SL: <strong>{totalQty} SP</strong></span>
                                    <span>Tổng tạm tính: <strong>{formatCurrency(subtotal)}</strong></span>
                                    {discount > 0 && (
                                      <span className="text-emerald-600 dark:text-emerald-400">
                                        Tổng KM: <strong>-{formatCurrency(discount)}</strong>
                                      </span>
                                    )}
                                    <span>
                                      Tổng thanh toán ({subOrders.length} đơn):{' '}
                                      <strong className="text-blue-600 dark:text-blue-400 text-sm">{formatCurrency(order.totalAmount)}</strong>
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className={isMerged ? 'grid grid-cols-1 xl:grid-cols-2 gap-4' : 'space-y-3'}>
                                {subOrders.map((subOrder, subIdx) => {
                                  const subDetails = subOrder.details || [];
                                  const subQty = subDetails.reduce((s, d) => s + Number(d.quantity || 0), 0);
                                  const subSubtotal = Number(subOrder.subtotalAmount ?? subOrder.totalAmount ?? 0);
                                  const subDiscount = Number(subOrder.discountAmount || 0);
                                  const subVouchers = subOrder.voucherDetails || [];
                                  const subCode = subOrder.orderCode ? `#${subOrder.orderCode}` : `#${subOrder.id}`;
                                  const subEmps = extractOrderEmployees(subOrder);

                                  return (
                                    <div
                                      key={subOrder.id}
                                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                          {isMerged && (
                                            <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[11px] font-bold">
                                              Đơn hàng #{subIdx + 1}
                                            </span>
                                          )}
                                          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                                            <Package className="w-3.5 h-3.5" />
                                            {subCode}
                                          </span>
                                          <Badge variant={getStatusBadge(subOrder.status)}>
                                            {subOrder.status.toUpperCase()}
                                          </Badge>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => handleViewClick({ ...subOrder, subOrders: [subOrder] }, userName)}
                                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 transition"
                                          >
                                            <Eye className="w-3 h-3" />
                                            Điều phối đơn này
                                          </button>
                                        </div>
                                      </div>

                                      {/* Nhân viên phụ trách riêng của đơn con */}
                                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 bg-slate-50/70 dark:bg-slate-800/40 px-3 py-1.5 rounded-lg">
                                        <div className="flex flex-wrap items-center gap-3">
                                          {subEmps.handlingEmp && (
                                            <span>
                                              Điều phối: <strong className="text-indigo-600 dark:text-indigo-400">{subEmps.handlingEmp.fullName}</strong> ({subEmps.handlingEmp.employeeCode})
                                            </span>
                                          )}
                                          {subEmps.shippingEmp && (
                                            <span>
                                              Bưu tá: <strong className="text-blue-600 dark:text-blue-400">{subEmps.shippingEmp.fullName}</strong> ({subEmps.shippingEmp.employeeCode})
                                            </span>
                                          )}
                                        </div>
                                        <div>
                                          Người nhận: <strong className="text-slate-700 dark:text-slate-200">{subOrder.receiverName || userName}</strong>
                                        </div>
                                      </div>

                                      <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                          <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase">
                                              <th className="py-2 pr-2 w-8">STT</th>
                                              <th className="py-2 px-2">Sản phẩm</th>
                                              <th className="py-2 px-2">Phân loại</th>
                                              <th className="py-2 px-2 text-right">Đơn giá</th>
                                              <th className="py-2 px-2 text-center">SL</th>
                                              <th className="py-2 pl-2 text-right">Thành tiền</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {subDetails.map((d, idx) => {
                                              const pName = d.productName || d.productVariant?.productColor?.product?.name || 'Sản phẩm';
                                              const cName = d.colorName || d.productVariant?.productColor?.color || 'Mặc định';
                                              const sName = d.sizeName || d.productVariant?.size || 'Free';
                                              const unitPrice = Number(d.price || 0);
                                              const qty = Number(d.quantity || 0);
                                              return (
                                                <tr key={d.id || idx}>
                                                  <td className="py-2 pr-2 font-mono text-slate-400">{idx + 1}</td>
                                                  <td className="py-2 px-2 font-medium text-slate-800 dark:text-slate-100">{pName}</td>
                                                  <td className="py-2 px-2 text-slate-500">{cName} / Size {sName}</td>
                                                  <td className="py-2 px-2 text-right text-slate-700 dark:text-slate-300">{formatCurrency(unitPrice)}</td>
                                                  <td className="py-2 px-2 text-center font-semibold text-slate-800 dark:text-slate-100">x{qty}</td>
                                                  <td className="py-2 pl-2 text-right font-semibold text-slate-800 dark:text-slate-100">
                                                    {formatCurrency(unitPrice * qty)}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                          <tfoot>
                                            <tr className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 font-semibold">
                                              <td colSpan={4} className="py-2 px-2 text-right text-slate-600 dark:text-slate-300">
                                                Tạm tính đơn #{subIdx + 1}:
                                              </td>
                                              <td className="py-2 px-2 text-center text-blue-600">{subQty} SP</td>
                                              <td className="py-2 pl-2 text-right text-slate-800 dark:text-slate-100">
                                                {formatCurrency(subSubtotal)}
                                              </td>
                                            </tr>
                                          </tfoot>
                                        </table>
                                      </div>

                                      {/* Khuyến mãi & Tổng tiền của đơn con */}
                                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          {subVouchers.length > 0 ? (
                                            subVouchers.map((vd, i) => (
                                              <span
                                                key={vd.id || i}
                                                className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                                              >
                                                <Tag className="w-3 h-3 inline mr-1" />
                                                <strong>{vd.voucher?.code || 'VOUCHER'}</strong>: -{formatCurrency(vd.discountAmount)}
                                              </span>
                                            ))
                                          ) : subDiscount > 0 ? (
                                            <span className="text-emerald-600 font-semibold">
                                              Giảm giá KM: -{formatCurrency(subDiscount)}
                                            </span>
                                          ) : (
                                            <span className="text-slate-400 italic">Không áp dụng voucher</span>
                                          )}
                                        </div>
                                        <div className="text-right font-bold text-slate-800 dark:text-slate-100">
                                          Thành tiền đơn #{subIdx + 1}:{' '}
                                          <span className="text-blue-600 text-sm">{formatCurrency(subOrder.totalAmount)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
            fetchOrders(true);
          }}
        />
      )}
    </div>
  );
}
