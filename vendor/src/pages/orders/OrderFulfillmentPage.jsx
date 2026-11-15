import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Boxes,
  Truck,
  CheckCircle2,
  Ban,
  Search,
  RefreshCw,
  Printer,
  Package,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate, formatShortOrderCode } from '../../utils/formatHelpers';
import { Badge, Button, useToast } from '../../components/ui';
import CancelVendorOrderModal from './components/CancelVendorOrderModal';
import PackingSlipPrintModal from './components/PackingSlipPrintModal';

const NEXT_STEP_ACTION = {
  pending: {
    nextStatus: 'confirmed',
    label: 'Xác nhận đơn hàng',
    icon: CheckCircle2,
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold',
    confirmMessage: (code) => `Xác nhận tiếp nhận kiện hàng ${code} từ hệ thống MIVA?`,
    cancelLabel: 'Hủy',
    cancelVariant: 'danger',
  },
  confirmed: {
    nextStatus: 'processing',
    label: 'Tiếp nhận & Bắt đầu đóng gói',
    icon: Boxes,
    buttonClass:
      'bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#2A5C4A] dark:hover:bg-[#35755B] text-white font-semibold',
    confirmMessage: (code) => `Bắt đầu đóng gói kiện hàng ${code}?`,
    cancelLabel: 'Hủy',
    cancelVariant: 'danger',
  },
  processing: {
    nextStatus: 'ready_for_pickup',
    label: 'Đã đóng gói xong - Sẵn sàng bàn giao',
    icon: Check,
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold',
    confirmMessage: (code) =>
      `Xác nhận đã đóng gói xong kiện hàng ${code} và sẵn sàng bàn giao cho bưu tá MIVA?`,
    cancelLabel: 'Hủy',
    cancelVariant: 'danger',
  },
  ready_for_pickup: {
    nextStatus: 'shipping',
    label: 'Xác nhận bưu tá đã lấy hàng',
    icon: Truck,
    buttonClass: 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold',
    confirmMessage: (code) => `Xác nhận bưu tá MIVA đã tiếp nhận kiện hàng ${code} để đi giao?`,
    cancelLabel: 'Hủy kiện',
    cancelVariant: 'outline',
  },
};

function renderVendorOrderStatusBadge(status) {
  switch (status) {
    case 'pending':
      return <Badge variant="warning">Chờ Shop xác nhận</Badge>;
    case 'confirmed':
      return <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20">Đã xác nhận</Badge>;
    case 'processing':
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Đang đóng gói</Badge>;
    case 'ready_for_pickup':
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          Sẵn sàng gửi ship
        </Badge>
      );
    case 'shipping':
      return <Badge variant="info">Đang vận chuyển</Badge>;
    case 'delivered':
      return <Badge variant="success">Giao thành công</Badge>;
    case 'cancelled':
      return <Badge variant="error">Đã hủy</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

export default function OrderFulfillmentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [vendorOrders, setVendorOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebouncedValue(search, 300);

  const [packingSlipModal, setPackingSlipModal] = useState(null);
  const [cancelModalItem, setCancelModalItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const latestRequest = useRef(0);

  const fetchFulfillmentOrders = useCallback(async () => {
    const request = ++latestRequest.current;
    try {
      setLoading(true);
      const data = await orderService.getFulfillmentOrders();
      if (request !== latestRequest.current) return;
      setVendorOrders(Array.isArray(data) ? data : []);
      setLoadError('');
    } catch (err) {
      console.error('Error fetching fulfillment orders:', err);
      if (request === latestRequest.current) {
        setLoadError('Không tải được danh sách kiện hàng. Vui lòng thử làm mới.');
      }
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFulfillmentOrders();
  }, [fetchFulfillmentOrders]);

  useEffect(() => {
    window.addEventListener('miva:orders', fetchFulfillmentOrders);
    return () => window.removeEventListener('miva:orders', fetchFulfillmentOrders);
  }, [fetchFulfillmentOrders]);

  const handleUpdateStatus = async (item, newStatus, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    try {
      setActionLoading(true);
      await orderService.updateVendorOrderStatus(item.id, newStatus, '');
      toast.success(`Đã cập nhật trạng thái kiện hàng #${item.vendorOrderCode}.`);
      await fetchFulfillmentOrders();
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        err.message;
      toast.error('Không thể cập nhật trạng thái: ' + msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancel = async (fullNote) => {
    if (!cancelModalItem) return;
    try {
      setActionLoading(true);
      await orderService.updateVendorOrderStatus(cancelModalItem.id, 'cancelled', fullNote);
      toast.success(`Đã hủy kiện hàng #${cancelModalItem.vendorOrderCode}.`);
      setCancelModalItem(null);
      await fetchFulfillmentOrders();
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        err.message;
      toast.error('Hủy kiện hàng thất bại: ' + msg);
    } finally {
      setActionLoading(false);
    }
  };

  const stats = useMemo(() => {
    const counts = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      ready: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0,
    };
    vendorOrders.forEach((vo) => {
      if (vo.status === 'pending') counts.pending += 1;
      else if (vo.status === 'confirmed') counts.confirmed += 1;
      else if (vo.status === 'processing') counts.processing += 1;
      else if (vo.status === 'ready_for_pickup') counts.ready += 1;
      else if (vo.status === 'shipping') counts.shipping += 1;
      else if (vo.status === 'delivered') counts.delivered += 1;
      else if (vo.status === 'cancelled') counts.cancelled += 1;
    });
    return {
      ...counts,
      urgent: counts.pending + counts.confirmed + counts.processing,
      total: vendorOrders.length,
    };
  }, [vendorOrders]);

  const filterTabs = [
    { id: 'all', label: 'Tất cả kiện hàng', count: stats.total },
    { id: 'urgent', label: '⚡ Cần xử lý gấp', count: stats.urgent, highlight: true },
    { id: 'pending', label: 'Chờ xác nhận', count: stats.pending },
    { id: 'confirmed', label: 'Đã xác nhận', count: stats.confirmed },
    { id: 'processing', label: 'Đang đóng gói', count: stats.processing },
    { id: 'ready_for_pickup', label: 'Sẵn sàng gửi ship', count: stats.ready },
    { id: 'shipping', label: 'Đang giao', count: stats.shipping },
    { id: 'delivered', label: 'Đã giao xong', count: stats.delivered },
    { id: 'cancelled', label: 'Đã hủy', count: stats.cancelled },
  ];

  const filteredOrders = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return vendorOrders.filter((vo) => {
      let matchTab = true;
      if (activeTab === 'urgent') {
        matchTab =
          vo.status === 'pending' || vo.status === 'confirmed' || vo.status === 'processing';
      } else if (activeTab !== 'all') {
        matchTab = vo.status === activeTab;
      }
      if (!matchTab) return false;
      if (!q) return true;

      return (
        (vo.vendorOrderCode || '').toLowerCase().includes(q) ||
        (vo.order?.orderCode || '').toLowerCase().includes(q) ||
        (vo.shipment?.trackingNumber || '').toLowerCase().includes(q) ||
        (vo.details || []).some((d) => (d.productName || '').toLowerCase().includes(q))
      );
    });
  }, [vendorOrders, activeTab, debouncedSearch]);

  return (
    <div className="space-y-6">
      {loadError && (
        <p role="alert" className="text-sm text-rose-600 font-medium">
          {loadError}
        </p>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Boxes className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Quản lý Đơn hàng &amp; Đóng gói Xuất kho
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi toàn bộ kiện hàng của Shop, xác nhận chuẩn bị hàng, in phiếu đóng gói và bàn giao cho bưu tá MIVA Express.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchFulfillmentOrders}
          disabled={loading}
          className="flex items-center gap-2 shadow-xs self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới danh sách
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : tab.highlight && tab.count > 0
                    ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo Mã kiện (VO-...), Mã đơn, Tên sản phẩm, Mã vận đơn..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Hiển thị <span className="font-bold text-slate-800 dark:text-slate-200">{filteredOrders.length}</span> kiện hàng
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-sm text-slate-500">Đang tải danh sách đơn hàng điều phối...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
            Không có kiện hàng nào
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Không tìm thấy kiện hàng nào phù hợp với bộ lọc hiện tại. Khi Admin hoặc Nhân viên điều phối đơn hàng, danh sách sẽ tự động cập nhật tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((vo) => {
            const nextAction = NEXT_STEP_ACTION[vo.status];
            const ActionIcon = nextAction?.icon;
            const waitingForConfirmation = vo.order?.status === 'pending';
            const parentClosed = ['cancelled', 'completed'].includes(vo.order?.status);
            const isCancelled = vo.status === 'cancelled';
            const isCompleted = vo.status === 'delivered';
            const isShipping = vo.status === 'shipping';
            const subtotal = Number(vo.subtotalAmount || 0);

            return (
              <div
                key={vo.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all hover:shadow-md"
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase">
                        Mã đơn hàng:
                      </span>
                      <span
                        className="font-mono font-bold text-sm text-indigo-700 dark:text-indigo-300"
                        title={vo.order?.orderCode}
                      >
                        #{formatShortOrderCode(vo.order?.orderCode || vo.orderId)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-[11px] text-slate-400">Mã kiện shop:</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                        {vo.vendorOrderCode}
                      </span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs text-slate-500">
                      Thời gian: {formatDate(vo.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Điều phối MIVA
                    </span>
                    {renderVendorOrderStatusBadge(vo.status)}
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-7 space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-indigo-500" />
                      Sản phẩm cần đóng gói ({(vo.details || []).length} mục)
                    </h4>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 p-2">
                      {(vo.details || []).map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="py-2.5 first:pt-1 last:pb-1 flex items-center gap-3"
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-white shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                              <Package className="w-5 h-5 text-slate-400" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {item.productName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {item.colorName ? `Màu: ${item.colorName}` : ''}{' '}
                              {item.sizeName ? `• Size: ${item.sizeName}` : ''}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-xs text-slate-500">
                              {formatCurrency(item.price)}{' '}
                              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                x{item.quantity}
                              </span>
                            </p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                              {formatCurrency(Number(item.price) * Number(item.quantity))}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {vo.notes && (
                      <div className="text-xs p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          Ghi chú kiện:
                        </span>{' '}
                        {vo.notes}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-5 space-y-4">
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-indigo-500" />
                        Bưu tá &amp; Vận chuyển MIVA
                      </h4>

                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Mã vận đơn:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {vo.shipment?.trackingNumber || 'Chờ bưu tá tạo mã'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Bưu tá tiếp nhận:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {vo.shipment?.carrier?.fullName || 'Bưu tá MIVA Express'}
                          </span>
                        </div>
                        {vo.shipment?.carrier?.phone && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">SĐT Bưu tá:</span>
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">
                              {vo.shipment.carrier.phone}
                            </span>
                          </div>
                        )}
                        <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                          <span className="text-slate-500">Tổng giá trị kiện hàng:</span>
                          <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      {waitingForConfirmation && (
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          Chờ Admin hoặc nhân viên MIVA xác nhận đơn hàng trước khi đóng gói.
                        </p>
                      )}
                      {parentClosed && !isCancelled && !isCompleted && (
                        <p className="text-xs text-slate-500">
                          Đơn hàng đã kết thúc, không thể cập nhật kiện hàng.
                        </p>
                      )}

                      {nextAction && (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() =>
                              handleUpdateStatus(
                                vo,
                                nextAction.nextStatus,
                                nextAction.confirmMessage(vo.vendorOrderCode),
                              )
                            }
                            disabled={actionLoading || waitingForConfirmation || parentClosed}
                            className={`flex-1 text-xs py-2.5 flex items-center justify-center gap-2 shadow-xs ${nextAction.buttonClass}`}
                          >
                            {ActionIcon && <ActionIcon className="w-4 h-4" />}
                            {nextAction.label}
                          </Button>

                          <Button
                            variant={nextAction.cancelVariant}
                            onClick={() => setCancelModalItem(vo)}
                            disabled={actionLoading || parentClosed}
                            className={`text-xs py-2.5 px-3 flex items-center justify-center gap-1.5 ${
                              nextAction.cancelVariant === 'outline'
                                ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                                : ''
                            }`}
                            title="Từ chối / Hủy kiện nếu hết hàng hoặc sự cố"
                          >
                            {nextAction.cancelVariant === 'danger' && <Ban className="w-3.5 h-3.5" />}
                            {nextAction.cancelLabel}
                          </Button>
                        </div>
                      )}

                      {isShipping && (
                        <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                          <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>Kiện hàng đang được bưu tá vận chuyển giao tới khách hàng.</span>
                        </div>
                      )}

                      {isCompleted && (
                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Kiện hàng đã giao thành công và hoàn tất đối soát.</span>
                        </div>
                      )}

                      {isCancelled && (
                        <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                          <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Kiện hàng này đã hủy. Tồn kho sản phẩm đã được tự động hoàn lại.</span>
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        onClick={() => setPackingSlipModal(vo)}
                        className="w-full text-xs text-slate-500 hover:text-indigo-600 py-1.5 flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        In Phiếu Đóng Gói
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CancelVendorOrderModal
        vendorOrder={cancelModalItem}
        isOpen={Boolean(cancelModalItem)}
        onClose={() => setCancelModalItem(null)}
        onConfirm={handleConfirmCancel}
        loading={actionLoading}
      />

      <PackingSlipPrintModal
        vendorOrder={packingSlipModal}
        storeName={user?.storeName}
        isOpen={Boolean(packingSlipModal)}
        onClose={() => setPackingSlipModal(null)}
      />
    </div>
  );
}
