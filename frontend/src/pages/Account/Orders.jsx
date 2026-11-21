import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Store,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { orderService } from '../../services/orderService';
import { useToast } from '../../components/common/Toast/Toast';
import { formatPrice } from '../../utils/formatPrice';
import {
  groupOrdersByCheckoutBatch,
  computeBatchOrderFinancials,
  getOrderStoreName,
  formatShortOrderCode,
} from '../../utils/orderHelpers';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import OrderItemRow from './components/OrderItemRow';
import OrderReviewModal from './components/OrderReviewModal';
import OrderCancelModal from './components/OrderCancelModal';

const STATUS_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
];

function matchesOrderTab(order, tabKey) {
  if (tabKey === 'all') return true;
  const subs = order.subOrders || [order];
  if (tabKey === 'pending') return subs.some((so) => so.status === 'pending');
  if (tabKey === 'shipping') {
    return subs.some((so) => ['confirmed', 'processing', 'shipping'].includes(so.status));
  }
  if (tabKey === 'completed') return subs.some((so) => so.status === 'completed');
  if (tabKey === 'cancelled') return subs.some((so) => so.status === 'cancelled');
  return true;
}

function getStatusColor(status) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-500 dark:border-yellow-700/50';
    case 'confirmed':
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50';
    case 'processing':
      return 'bg-primary/15 text-primary-dark border-primary/30 dark:bg-primary/20 dark:text-primary dark:border-primary/40';
    case 'shipping':
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700/50';
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700/50';
    case 'cancelled':
      return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-700/50';
    case 'mixed':
      return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700/50';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }
}

function getStatusText(status) {
  switch (status) {
    case 'pending':
      return 'Chờ xác nhận';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'processing':
      return 'Người bán đang chuẩn bị hàng';
    case 'shipping':
      return 'Đang giao hàng';
    case 'completed':
      return 'Đã giao thành công';
    case 'cancelled':
      return 'Đã hủy đơn';
    case 'mixed':
      return 'Nhiều trạng thái';
    default:
      return status;
  }
}

export default function Orders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { orders, isLoading, refetch } = useOrders();

  const groupedOrders = useMemo(() => groupOrdersByCheckoutBatch(orders), [orders]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewedMap, setReviewedMap] = useState({});
  const [cancelTarget, setCancelTarget] = useState(null);
  const [reorderingKey, setReorderingKey] = useState(null);

  const handleReorder = async (orderIds, key) => {
    if (!orderIds?.length || reorderingKey) return;
    try {
      setReorderingKey(key);
      const res = await orderService.reorder(orderIds);
      const data = res?.data ?? res;

      await queryClient.invalidateQueries({ queryKey: ['cart'] });

      const warnings = data?.warnings || {};
      const notices = [];
      if (warnings.skippedItems?.length) {
        notices.push(
          `${warnings.skippedItems.length} sản phẩm đã hết hàng/ngừng bán và được bỏ qua`,
        );
      }
      if (warnings.adjustedItems?.length) {
        notices.push(
          `${warnings.adjustedItems.length} sản phẩm được điều chỉnh theo tồn kho hiện tại`,
        );
      }
      if (warnings.expiredVoucherCodes?.length) {
        notices.push(
          `Mã ${warnings.expiredVoucherCodes.join(', ')} đã hết hạn/hết lượt nên không áp dụng lại`,
        );
      }
      if (notices.length > 0) {
        toast.warning(notices.join('. '));
      }

      navigate('/checkout', {
        state: {
          cartItemIds: data.cartItemIds,
          voucherSelections: data.voucherSelections || [],
          platformVoucherCode: data.platformVoucherCode || null,
          reorderData: {
            paymentMethod: data.paymentMethod,
            ...(data.shippingSnapshot || {}),
          },
        },
      });
    } catch (error) {
      const msg =
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Không thể mua lại đơn hàng này. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setReorderingKey(null);
    }
  };

  const tabCounts = useMemo(() => {
    const counts = {};
    STATUS_TABS.forEach(({ key }) => {
      counts[key] = groupedOrders.filter((o) => matchesOrderTab(o, key)).length;
    });
    return counts;
  }, [groupedOrders]);

  const filteredOrders = useMemo(
    () => groupedOrders.filter((o) => matchesOrderTab(o, statusFilter)),
    [groupedOrders, statusFilter],
  );

  const toggleGroupExpand = (groupId) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleOpenReview = (item, orderId) => {
    setReviewItem({ ...item, orderId });
  };

  const handleReviewSubmitted = (orderDetailId, reviewData) => {
    setReviewedMap((prev) => ({ ...prev, [orderDetailId]: reviewData }));
    refetch?.();
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl py-12">
        <Loading text="Đang tải danh sách đơn hàng..." />
      </div>
    );
  }

  if (groupedOrders.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl py-10">
        <EmptyState
          icon={Package}
          title="Chưa có đơn hàng nào"
          description="Khi bạn đặt hàng, danh sách đơn hàng sẽ xuất hiện tại đây."
          actionText="Bắt đầu mua sắm"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Status Filter Tabs */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Lịch sử đơn hàng</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-1">
            Quản lý, theo dõi quá trình giao nhận và đánh giá sản phẩm đã mua
          </p>
        </div>

        {/* Status Filter Tab Bar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl overflow-x-auto scrollbar-none shadow-xs">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.key;
            const count = tabCounts[tab.key] || 0;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#1A3A2C] text-white shadow-sm'
                    : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-light-bg dark:bg-dark-bg text-light-muted dark:text-dark-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl py-10">
          <EmptyState
            icon={Package}
            title="Không có đơn hàng ở trạng thái này"
            description="Thử chọn bộ lọc trạng thái khác để xem toàn bộ lịch sử đơn mua của bạn."
            actionText="Xem tất cả đơn hàng"
            onAction={() => setStatusFilter('all')}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const subOrders = order.subOrders || [order];
            const isMerged = order.isMergedGroup && subOrders.length > 1;
            const isExpanded = !collapsedGroups[order.id];
            const fin = computeBatchOrderFinancials(subOrders);

            const storeNames = Array.from(
              new Set(subOrders.map((so) => getOrderStoreName(so)).filter(Boolean)),
            );

            const groupStatus = order.groupStatus || order.status;
            const isAllPending = subOrders.every((so) => so.status === 'pending');
            const isAllCompleted = subOrders.every((so) => so.status === 'completed');
            const isAllCancelled = fin.isAllCancelled;
            const isAnyShipping = subOrders.some((so) => so.status === 'shipping');

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl overflow-hidden shadow-xs transition hover:shadow-md"
              >
                {/* Order Header */}
                <div className="p-4 sm:p-5 border-b border-light-border dark:border-dark-border flex flex-wrap items-center justify-between gap-4 bg-light-bg/70 dark:bg-dark-bg/60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className="text-xs font-mono font-bold text-light-muted dark:text-dark-muted"
                        title={order.orderCode || order.id}
                      >
                        {isMerged ? 'MÃ HÓA ĐƠN GỘP' : 'MÃ ĐƠN'} #
                        {formatShortOrderCode(order.orderCode || order.id)}
                      </p>

                      {storeNames.map((sName) => (
                        <span
                          key={sName}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        >
                          <Store className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          {sName}
                        </span>
                      ))}
                    </div>

                    <p className="font-semibold text-xs text-light-text dark:text-dark-text">
                      lúc{' '}
                      {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-5">
                    <div className="text-right">
                      {fin.isPartiallyCancelled ? (
                        <>
                          <p className="text-xs text-light-muted dark:text-dark-muted mb-0.5">
                            Thực thanh toán ({fin.activeCount}/{fin.totalSubCount} đơn)
                          </p>
                          <p className="font-bold text-base sm:text-lg text-primary">
                            {formatPrice(fin.activeTotalAmount)}
                          </p>
                          <p className="text-[11px] font-medium mt-0.5 flex items-center justify-end gap-1 flex-wrap">
                            <span className="line-through text-light-muted dark:text-dark-muted">
                              {formatPrice(fin.originalTotalAmount)}
                            </span>
                            <span className="text-rose-600 dark:text-rose-400 font-semibold">
                              &bull; Đã hủy {fin.cancelledCount} đơn (-{formatPrice(fin.cancelledAmount)})
                            </span>
                          </p>
                        </>
                      ) : fin.isAllCancelled ? (
                        <>
                          <p className="text-xs text-light-muted dark:text-dark-muted mb-0.5">
                            {isMerged
                              ? `Thực thanh toán (Đã hủy ${fin.totalSubCount}/${fin.totalSubCount})`
                              : 'Thực thanh toán (Đã hủy)'}
                          </p>
                          <p className="font-bold text-base sm:text-lg text-light-muted dark:text-dark-muted">
                            0 ₫
                          </p>
                          <p className="text-[11px] font-medium mt-0.5 flex items-center justify-end gap-1 flex-wrap">
                            <span className="line-through text-light-muted dark:text-dark-muted">
                              {formatPrice(fin.originalTotalAmount)}
                            </span>
                            <span className="text-rose-600 dark:text-rose-400 font-semibold">
                              &bull; Đã hủy
                            </span>
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-light-muted dark:text-dark-muted mb-0.5">
                            {isMerged
                              ? `Tổng thanh toán (${subOrders.length} đơn)`
                              : 'Tổng thanh toán'}
                          </p>
                          <p className="font-bold text-base sm:text-lg text-primary">
                            {formatPrice(fin.activeTotalAmount)}
                          </p>
                        </>
                      )}
                    </div>

                    <div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(
                          groupStatus,
                        )}`}
                      >
                        {groupStatus === 'mixed' && fin.isPartiallyCancelled
                          ? `${fin.activeCount}/${fin.totalSubCount} đơn hiệu lực`
                          : getStatusText(groupStatus)}
                      </span>
                    </div>

                    {isMerged && (
                      <button
                        type="button"
                        onClick={() => toggleGroupExpand(order.id)}
                        className="p-1.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card hover:bg-light-bg dark:hover:bg-dark-bg text-light-muted dark:text-dark-muted transition cursor-pointer"
                        title={isExpanded ? 'Thu gọn chi tiết' : 'Xem chi tiết các đơn con'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Dải Banner Hóa đơn gộp */}
                {isMerged && (
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5 bg-primary/10 dark:bg-primary/15 border-b border-primary/20 text-xs">
                    <div className="font-bold text-[#1A3A2C] dark:text-primary flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      Hóa đơn gộp gồm {subOrders.length} đơn hàng đặt cùng lượt (
                      {new Date(order.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')})
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-light-text dark:text-dark-text font-medium">
                      {fin.isPartiallyCancelled ? (
                        <>
                          <span>
                            SL còn giao: <strong>{fin.activeQty} SP</strong>{' '}
                            <span className="text-light-muted dark:text-dark-muted">
                              (/{fin.originalQty} SP)
                            </span>
                          </span>
                          <span>
                            Tạm tính còn lại: <strong>{formatPrice(fin.activeSubtotalAmount)}</strong>
                          </span>
                          {fin.activeDiscountAmount > 0 && (
                            <span className="text-emerald-700 dark:text-emerald-400">
                              KM áp dụng: <strong>-{formatPrice(fin.activeDiscountAmount)}</strong>
                            </span>
                          )}
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            Đã hủy {fin.cancelledCount} đơn: -{formatPrice(fin.cancelledAmount)}
                          </span>
                          <span>
                            Thực thanh toán ({fin.activeCount}/{fin.totalSubCount} đơn):{' '}
                            <strong className="text-primary text-sm font-bold">
                              {formatPrice(fin.activeTotalAmount)}
                            </strong>
                            <span className="line-through text-light-muted dark:text-dark-muted ml-1.5">
                              {formatPrice(fin.originalTotalAmount)}
                            </span>
                          </span>
                        </>
                      ) : fin.isAllCancelled ? (
                        <>
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            Đã hủy toàn bộ {fin.totalSubCount}/{fin.totalSubCount} đơn (-
                            {formatPrice(fin.cancelledAmount)})
                          </span>
                          <span>
                            Thực thanh toán:{' '}
                            <strong className="text-light-muted dark:text-dark-muted text-sm font-bold">
                              0 ₫
                            </strong>
                            <span className="line-through text-light-muted dark:text-dark-muted ml-1.5">
                              {formatPrice(fin.originalTotalAmount)}
                            </span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span>
                            Tổng SL: <strong>{fin.activeQty} SP</strong>
                          </span>
                          <span>
                            Tổng tạm tính: <strong>{formatPrice(fin.activeSubtotalAmount)}</strong>
                          </span>
                          {fin.activeDiscountAmount > 0 && (
                            <span className="text-emerald-700 dark:text-emerald-400">
                              Tổng KM: <strong>-{formatPrice(fin.activeDiscountAmount)}</strong>
                            </span>
                          )}
                          <span>
                            Tổng thanh toán ({subOrders.length} đơn):{' '}
                            <strong className="text-primary text-sm font-bold">
                              {formatPrice(fin.activeTotalAmount)}
                            </strong>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Note Banners */}
                {isAnyShipping && (
                  <div className="px-5 py-2.5 bg-purple-50 dark:bg-purple-950/30 border-b border-purple-100 dark:border-purple-900/40 text-xs text-purple-800 dark:text-purple-300 flex items-center gap-2">
                    <Truck className="w-4 h-4 shrink-0 text-purple-600" />
                    <span>
                      <strong>Đơn hàng đang trên đường giao:</strong> Quý khách vui lòng kiểm tra điện thoại khi nhân viên giao hàng liên hệ.
                    </span>
                  </div>
                )}

                {isAllCompleted && (
                  <div className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>
                        <strong>Giao hàng thành công!</strong> Hãy dành ít phút đánh giá chất lượng sản phẩm để nhận điểm tích lũy.
                      </span>
                    </div>
                  </div>
                )}

                {isAllCancelled && (
                  <div className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>
                        <strong>Đơn hàng đã được hủy:</strong>{' '}
                        {order.payment?.status === 'refunded'
                          ? 'Tiền thanh toán trước đã được hoàn trả về ví/tài khoản của bạn.'
                          : 'Yêu cầu thanh toán đã được hủy, không phát sinh chi phí.'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Chi tiết đơn hàng */}
                {isMerged ? (
                  isExpanded && (
                    <div className="p-4 sm:p-6 bg-light-bg/50 dark:bg-dark-bg/40 space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {subOrders.map((subOrder, subIdx) => {
                          const subStoreName = getOrderStoreName(subOrder);
                          const subDetails = subOrder.details || [];
                          const subQty = subDetails.reduce(
                            (sum, d) => sum + Number(d.quantity || 0),
                            0,
                          );
                          const subSubtotal = Number(
                            subOrder.subtotalAmount ?? subOrder.totalAmount ?? 0,
                          );
                          const subDiscount = Number(subOrder.discountAmount || 0);
                          const subFullCode = subOrder.orderCode || subOrder.id;
                          const subCode = `#${formatShortOrderCode(subFullCode)}`;
                          const isSubPending = subOrder.status === 'pending';
                          const isSubCancelled = subOrder.status === 'cancelled';

                          return (
                            <div
                              key={subOrder.id}
                              className={`rounded-xl border p-4 space-y-3 shadow-xs flex flex-col justify-between transition ${
                                isSubCancelled
                                  ? 'border-rose-200/80 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10 opacity-85'
                                  : 'border-light-border dark:border-dark-border bg-white dark:bg-dark-card'
                              }`}
                            >
                              {/* Header của Đơn hàng con */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-light-border dark:border-dark-border pb-2.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-white text-[11px] font-bold ${
                                      isSubCancelled ? 'bg-gray-400 dark:bg-gray-600' : 'bg-[#1A3A2C]'
                                    }`}
                                  >
                                    Đơn hàng #{subIdx + 1}
                                  </span>
                                  <span
                                    className={`text-xs font-mono font-bold ${
                                      isSubCancelled
                                        ? 'text-light-muted dark:text-dark-muted line-through'
                                        : 'text-primary'
                                    }`}
                                    title={subFullCode}
                                  >
                                    {subCode}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(
                                      subOrder.status,
                                    )}`}
                                  >
                                    {getStatusText(subOrder.status)}
                                  </span>
                                </div>

                                {subStoreName && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                    <Store className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                    {subStoreName}
                                  </span>
                                )}
                              </div>

                              {/* Danh sách sản phẩm của Đơn hàng con */}
                              <ul className="divide-y divide-light-border dark:divide-dark-border flex-1">
                                {subDetails.map((item) => (
                                  <OrderItemRow
                                    key={item.id}
                                    item={item}
                                    orderId={subOrder.id}
                                    orderStatus={subOrder.status}
                                    reviewedData={reviewedMap[item.id]}
                                    onOpenReview={handleOpenReview}
                                    compact
                                  />
                                ))}
                              </ul>

                              {/* Footer & Tạm tính của Đơn con */}
                              <div className="pt-2.5 border-t border-light-border dark:border-dark-border space-y-1.5 text-xs">
                                <div className="flex items-center justify-between text-light-muted dark:text-dark-muted">
                                  <span>Tạm tính đơn #{subIdx + 1}:</span>
                                  <span>
                                    <strong>{subQty} SP</strong> &bull;{' '}
                                    <span className={isSubCancelled ? 'line-through' : ''}>
                                      {formatPrice(subSubtotal)}
                                    </span>
                                  </span>
                                </div>

                                {subDiscount > 0 && (
                                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                                    <span>Khuyến mãi voucher:</span>
                                    <span className={isSubCancelled ? 'line-through opacity-70' : ''}>
                                      -{formatPrice(subDiscount)}
                                    </span>
                                  </div>
                                )}

                                {isSubCancelled ? (
                                  <div className="flex items-center justify-between font-bold pt-1 border-t border-dashed border-rose-200 dark:border-rose-800/60">
                                    <span className="text-rose-600 dark:text-rose-400">
                                      Đã hủy (Không thanh toán):
                                    </span>
                                    <span className="text-sm flex items-center gap-1.5">
                                      <span className="line-through text-light-muted dark:text-dark-muted font-semibold text-xs">
                                        {formatPrice(subOrder.totalAmount)}
                                      </span>
                                      <span className="text-rose-600 dark:text-rose-400 text-xs font-bold">
                                        (0 ₫)
                                      </span>
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between font-bold pt-1 border-t border-dashed border-light-border dark:border-dark-border">
                                    <span className="text-light-text dark:text-dark-text">
                                      Thành tiền đơn #{subIdx + 1}:
                                    </span>
                                    <span className="text-primary text-sm">
                                      {formatPrice(subOrder.totalAmount)}
                                    </span>
                                  </div>
                                )}

                                {(isSubPending || subOrder.status === 'completed') && (
                                  <div className="pt-2 flex justify-end gap-2">
                                    {isSubPending && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setCancelTarget({
                                            type: 'single',
                                            id: subOrder.id,
                                            code: formatShortOrderCode(
                                              subOrder.orderCode || subOrder.id,
                                            ),
                                          })
                                        }
                                        className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold transition cursor-pointer"
                                      >
                                        Hủy đơn hàng #{subIdx + 1}
                                      </button>
                                    )}
                                    {subOrder.status === 'completed' && (
                                      <button
                                        type="button"
                                        disabled={Boolean(reorderingKey)}
                                        onClick={() =>
                                          handleReorder([subOrder.id], `sub-${subOrder.id}`)
                                        }
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary hover:bg-primary-dark text-white text-[11px] font-semibold transition cursor-pointer disabled:opacity-50"
                                      >
                                        {reorderingKey === `sub-${subOrder.id}` ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <RotateCcw className="w-3 h-3" />
                                        )}
                                        Mua lại đơn #{subIdx + 1}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ) : (
                  /* Giao diện đơn lẻ */
                  <div className="p-4 sm:p-6">
                    <ul className="divide-y divide-light-border dark:divide-dark-border">
                      {order.details?.map((item) => (
                        <OrderItemRow
                          key={item.id}
                          item={item}
                          orderId={order.id}
                          orderStatus={order.status}
                          reviewedData={reviewedMap[item.id]}
                          onOpenReview={handleOpenReview}
                        />
                      ))}
                    </ul>
                  </div>
                )}

                {/* Order Footer Actions */}
                <div className="p-4 sm:px-6 py-3 border-t border-light-border dark:border-dark-border flex flex-wrap items-center justify-between gap-3 text-xs bg-light-bg/40 dark:bg-dark-bg/20">
                  <div className="text-light-muted dark:text-dark-muted flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-light-muted" />
                    <span>
                      Phương thức thanh toán:{' '}
                      <strong className="font-semibold uppercase text-light-text dark:text-dark-text">
                        {order.payment?.method || 'PAY_LATER'}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isMerged && isAllPending && (
                      <button
                        type="button"
                        onClick={() =>
                          setCancelTarget({
                            type: 'batch',
                            subOrders,
                            code: formatShortOrderCode(order.orderCode || order.id),
                          })
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition cursor-pointer"
                      >
                        Hủy toàn bộ {subOrders.length} đơn hàng
                      </button>
                    )}

                    {!isMerged && order.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() =>
                          setCancelTarget({
                            type: 'single',
                            id: order.id,
                            code: formatShortOrderCode(order.orderCode || order.id),
                          })
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition cursor-pointer"
                      >
                        Hủy đơn hàng
                      </button>
                    )}

                    {isMerged && isAllCompleted && (
                      <button
                        type="button"
                        disabled={Boolean(reorderingKey)}
                        onClick={() =>
                          handleReorder(
                            subOrders.map((so) => so.id),
                            `batch-${order.id}`,
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {reorderingKey === `batch-${order.id}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        Mua lại toàn bộ {subOrders.length} đơn
                      </button>
                    )}

                    {!isMerged && order.status === 'completed' && (
                      <button
                        type="button"
                        disabled={Boolean(reorderingKey)}
                        onClick={() => handleReorder([order.id], `single-${order.id}`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {reorderingKey === `single-${order.id}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        Mua lại
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <OrderReviewModal
        reviewItem={reviewItem}
        onClose={() => setReviewItem(null)}
        onReviewSubmitted={handleReviewSubmitted}
      />

      <OrderCancelModal
        cancelTarget={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCancelled={refetch}
      />
    </div>
  );
}
