import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Search,
  CheckCircle2,
  AlertOctagon,
  Send,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Store,
  Eye,
  UserCheck,
  Loader2,
  RefreshCw,
  History,
  Phone,
  Check,
  Truck,
} from 'lucide-react';
import { useToast } from '@shared/components/ui';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import { useAuth } from '../../contexts/AuthContext';
import { ordersApi } from '../../api/axiosClient';
import { formatOrder, formatShortOrderCode } from '../../utils/orderFormat';
import { OrderDetailModal } from '../../components/orders/OrderDetailModal';
import { OrderActionModal } from '../../components/orders/OrderActionModal';

const SUB_VIEWS = [
  { key: 'list', label: 'Danh sách điều phối', icon: Package },
  { key: 'sla', label: 'Theo dõi SLA Vendor', icon: Store },
  { key: 'audit', label: 'Nhật ký thao tác trang hiện tại', icon: History },
];

const STATUS_TABS = [
  { key: 'all', label: 'Tất cả đơn' },
  { key: 'pending', label: 'Chờ duyệt đơn' },
  { key: 'confirmed', label: 'Chờ chuyển Vendor' },
  { key: 'processing', label: 'Vendor đang xử lý' },
  { key: 'shipping', label: 'Bưu tá đang giao' },
  { key: 'completed', label: 'Giao hoàn tất' },
  { key: 'cancelled', label: 'Đã từ chối/hủy' },
];

const STATUS_BADGE = {
  pending: {
    label: 'Chờ xác nhận',
    class:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  },
  confirmed: {
    label: 'Đã xác nhận',
    class:
      'bg-[#EEF5F1] text-[#1A3A2C] border-[#B9D6C6] dark:bg-[#1A3A2C]/50 dark:text-[#8BBAA1] dark:border-[#2A5C4A]',
  },
  processing: {
    label: 'Vendor xử lý',
    class:
      'bg-[#FBF7EC] text-[#8C6B1F] border-[#E6D39A] dark:bg-[#C9A84C]/15 dark:text-[#DEC47E] dark:border-[#C9A84C]/35',
  },
  shipping: {
    label: 'Đang giao hàng',
    class:
      'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30',
  },
  completed: {
    label: 'Hoàn tất',
    class:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  cancelled: {
    label: 'Từ chối / Hủy',
    class:
      'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
  },
};

function getSlaBadgeMeta(order) {
  const deadlineStr = order.assignedVendor?.slaDeadline;
  if (!deadlineStr) {
    return {
      label: 'Chưa đặt SLA',
      color:
        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      isOverdue: false,
    };
  }
  const diffMs = new Date(deadlineStr).getTime() - Date.now();
  const diffHours = Math.round(diffMs / (1000 * 3600));

  if (diffMs < 0) {
    return {
      label: `Quá hạn SLA ${Math.abs(diffHours)} giờ!`,
      color:
        'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40',
      isOverdue: true,
    };
  }
  if (order.isVendorSlaWarning || diffHours <= 4) {
    return {
      label: order.isVendorSlaWarning
        ? `Quá 6h chờ kho (${Math.floor(order.vendorElapsedHours)}h)`
        : `Gấp: Còn ${diffHours} giờ`,
      color:
        'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40',
      isOverdue: Boolean(order.isVendorSlaWarning),
    };
  }
  return {
    label: `Còn ${diffHours} giờ (Đúng hạn)`,
    color:
      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40',
    isOverdue: false,
  };
}

export const OrdersPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeView = searchParams.get('view') || 'list';
  const currentTab = searchParams.get('status') || 'all';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [pageSize] = useState(20);
  const [onlyExceptions, setOnlyExceptions] = useState(
    () => searchParams.get('exception') === 'true',
  );
  const [onlyMyScope, setOnlyMyScope] = useState(true);
  const [onlyMyAssigned, setOnlyMyAssigned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // SLA & Audit sub-view local filters
  const [slaSearch, setSlaSearch] = useState('');
  const debouncedSlaSearch = useDebouncedValue(slaSearch, 300);
  const [urgingOrderId, setUrgingOrderId] = useState(null);
  const [urgedSuccessMap, setUrgedSuccessMap] = useState({});

  const [auditActorFilter, setAuditActorFilter] = useState('all');
  const [auditSearch, setAuditSearch] = useState('');
  const debouncedAuditSearch = useDebouncedValue(auditSearch, 300);

  // Server-side orders & counts state
  const [orders, setOrders] = useState([]);
  const [countsByStatus, setCountsByStatus] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Modals state owned cleanly by OrdersPage
  const [detailOrderId, setDetailOrderId] = useState(null);
  const [detailFallbackOrder, setDetailFallbackOrder] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { order, mode } | null

  const updateUrlParams = useCallback(
    (patch) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([k, v]) => {
        if (
          v === null ||
          v === undefined ||
          v === '' ||
          (k === 'view' && v === 'list') ||
          (k === 'status' && v === 'all')
        ) {
          next.delete(k);
        } else {
          next.set(k, String(v));
        }
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        itemPerPage: pageSize,
        ...(activeView === 'list' && currentTab !== 'all' ? { status: currentTab } : {}),
        ...(activeView === 'list' && debouncedSearch.trim()
          ? { search: debouncedSearch.trim() }
          : {}),
      };

      const res = await ordersApi.listAll(params);
      const rawList = res?.list || res?.data?.list || (Array.isArray(res) ? res : []);
      if (Array.isArray(rawList)) {
        setOrders(rawList.map(formatOrder).filter(Boolean));
      }
      if (res?.countsByStatus) {
        setCountsByStatus(res.countsByStatus);
      }
      if (res?.totalItems !== undefined) {
        setTotalItems(res.totalItems);
      }
      if (res?.totalPages !== undefined) {
        setTotalPages(Math.max(1, res.totalPages));
      }
    } catch (err) {
      toast.error(`Không thể tải danh sách đơn hàng: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeView, currentTab, debouncedSearch, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    window.addEventListener('miva:orders', fetchOrders);
    return () => window.removeEventListener('miva:orders', fetchOrders);
  }, [fetchOrders]);

  const detailOrder = useMemo(() => {
    if (!detailOrderId) return null;
    return orders.find((o) => o.id === detailOrderId) || detailFallbackOrder;
  }, [detailOrderId, orders, detailFallbackOrder]);

  const openDetailModal = (order) => {
    setDetailFallbackOrder(order);
    setDetailOrderId(order.id);
  };

  const closeDetailModal = () => {
    setDetailOrderId(null);
    setDetailFallbackOrder(null);
  };

  const openActionModal = (order, mode) => {
    setActionModal({ order, mode });
  };

  const canDispatch = user?.department?.includes('Điều phối') || user?.role === 'admin';
  const canHandleException = user?.department?.includes('Sự cố') || user?.role === 'admin';

  // Client-side scope & assigned filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (onlyMyScope && user) {
        if (user.assignedOrderScope === 'region_north' && order.region !== 'region_north') {
          return false;
        }
        if (user.assignedOrderScope === 'region_central' && order.region !== 'region_central') {
          return false;
        }
        if (user.assignedOrderScope === 'region_south' && order.region !== 'region_south') {
          return false;
        }
        if (
          user.assignedOrderScope === 'high_value_orders' &&
          (order.totalAmount || 0) < 1500000
        ) {
          return false;
        }
      }

      if (onlyMyAssigned && user) {
        const isMine =
          order.assignedCarrier?.id === user.id ||
          order.assignedCarrier?.employeeCode === user.employeeCode ||
          order.assignedCarrier?.email === user.email ||
          order.shipments?.some(
            (s) => s.carrierId === user.id || s.carrier?.email === user.email,
          ) ||
          order.handlingEmployee?.id === user.id ||
          order.handlingEmployee?.employeeCode === user.employeeCode ||
          order.exceptionEmployee?.id === user.id ||
          order.exceptionEmployee?.employeeCode === user.employeeCode ||
          order.statusHistory?.some(
            (h) =>
              h.employeeId === user.id ||
              h.employee?.id === user.id ||
              (user.employeeCode && h.employee?.employeeCode === user.employeeCode),
          );
        if (!isMine) {
          return false;
        }
      }

      if (onlyExceptions && !order.exception) {
        return false;
      }

      return true;
    });
  }, [orders, onlyExceptions, onlyMyScope, onlyMyAssigned, user]);

  // SLA Vendor sub-view list
  const slaVendorOrders = useMemo(() => {
    const base = orders.filter(
      (o) => o.assignedVendor !== null || o.status === 'processing' || o.status === 'shipping',
    );
    if (!debouncedSlaSearch.trim()) return base;
    const q = debouncedSlaSearch.toLowerCase();
    return base.filter(
      (o) =>
        (o.orderCode || '').toLowerCase().includes(q) ||
        (o.orderVendors || []).some(
          (v) => v.name?.toLowerCase().includes(q) || v.code?.toLowerCase().includes(q),
        ) ||
        o.assignedVendor?.name?.toLowerCase().includes(q) ||
        o.receiverName?.toLowerCase().includes(q),
    );
  }, [orders, debouncedSlaSearch]);

  // Audit history sub-view list (current page)
  const auditHistories = useMemo(() => {
    const list = [];
    orders.forEach((order) => {
      (order.statusHistory || []).forEach((h) => {
        list.push({
          ...h,
          orderId: order.id,
          orderCode: order.orderCode,
          orderTotal: order.totalAmount,
          receiverName: order.receiverName,
        });
      });
    });
    const sorted = list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return sorted.filter((h) => {
      if (auditActorFilter !== 'all') {
        if (auditActorFilter === 'employee' && !h.actorRole?.includes('Nhân viên')) return false;
        if (auditActorFilter === 'admin' && !h.actorRole?.includes('Admin')) return false;
        if (auditActorFilter === 'vendor' && !h.actorRole?.includes('Vendor')) return false;
        if (auditActorFilter === 'client' && !h.actorRole?.includes('Khách hàng')) return false;
      }
      if (debouncedAuditSearch.trim()) {
        const q = debouncedAuditSearch.toLowerCase();
        return (
          (h.orderCode || '').toLowerCase().includes(q) ||
          (h.actorName || '').toLowerCase().includes(q) ||
          (h.note || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, auditActorFilter, debouncedAuditSearch]);

  const handleUrgeVendor = async (order) => {
    try {
      setUrgingOrderId(order.id);
      const vendorName = order.assignedVendor?.name || 'Đối tác';
      await ordersApi.updateStatus(order.id, {
        status: order.status,
        note: `[Đốc thúc xuất kho] Nhân viên yêu cầu kho ${vendorName} ưu tiên xuất kiện hàng ngay!`,
        notifyTarget: 'vendor',
        title: `[Khẩn cấp] Đốc thúc xuất kho đơn #${order.orderCode || order.id.slice(0, 8)}`,
      });
      toast.success(`Đã gửi thông báo đốc thúc xuất kho tới ${vendorName}!`);
      setUrgedSuccessMap((prev) => ({ ...prev, [order.id]: true }));
      setTimeout(() => {
        setUrgedSuccessMap((prev) => ({ ...prev, [order.id]: false }));
      }, 4000);
      await fetchOrders();
    } catch (err) {
      toast.error(`Lỗi gửi đốc thúc Vendor: ${err.response?.data?.message || err.message}`);
    } finally {
      setUrgingOrderId(null);
    }
  };

  const pendingCount =
    countsByStatus?.pending ?? orders.filter((o) => o.status === 'pending').length;
  const confirmedCount =
    countsByStatus?.confirmed ?? orders.filter((o) => o.status === 'confirmed').length;
  const exceptionCount = orders.filter((o) => o.exception !== null).length;
  const slaWarningCount = orders.filter((o) => o.isVendorSlaWarning).length;
  const totalValue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Workspace Header + Sub-view Switcher */}
      <div className="bg-white dark:bg-[#131B17] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-[#1A3A2C] dark:text-[#DEC47E]" />
            <span>Điều Phối &amp; Giám Sát Đơn Hàng</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Xác nhận đơn, bàn giao đối tác Vendor, theo dõi cam kết SLA &gt;6h và tra cứu nhật ký
            thao tác
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl">
          {SUB_VIEWS.map((sv) => {
            const Icon = sv.icon;
            const isActive = activeView === sv.key;
            return (
              <button
                key={sv.key}
                type="button"
                onClick={() => updateUrlParams({ view: sv.key, page: '1' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#1A3A2C] text-[#1A3A2C] dark:text-[#DEC47E] shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sv.label}</span>
                {sv.key === 'sla' && slaWarningCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300">
                    {slaWarningCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-VIEW 1: DANH SÁCH ĐIỀU PHỐI */}
      {activeView === 'list' && (
        <>
          {/* Summary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#131B17] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Cần xác nhận ngay</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
                {pendingCount}
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                Quyền: Duyệt / Từ chối theo quy tắc
              </p>
            </div>

            <div className="bg-white dark:bg-[#131B17] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Chờ chuyển Vendor</span>
                <Send className="w-4 h-4 text-[#2A5C4A] dark:text-[#DEC47E]" />
              </div>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
                {confirmedCount}
              </p>
              <p className="text-[11px] text-[#2A5C4A] dark:text-[#8BBAA1] font-medium mt-0.5">
                Sẵn sàng bàn giao cho nhà cung cấp
              </p>
            </div>

            <div className="bg-white dark:bg-[#131B17] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Sự cố / Quá SLA &gt;6h</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
                {exceptionCount + slaWarningCount}
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">
                {exceptionCount} sự cố • {slaWarningCount} đơn trễ SLA kho
              </p>
            </div>

            <div className="bg-white dark:bg-[#131B17] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Tổng giá trị đơn hiển thị</span>
                <Package className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-extrabold text-[#1A3A2C] dark:text-[#DEC47E] mt-1">
                {totalValue.toLocaleString()} đ
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {filteredOrders.length} đơn hàng trong trang
              </p>
            </div>
          </div>

          {/* Scope and Filter bar */}
          <div className="bg-white dark:bg-[#131B17] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (page !== 1) updateUrlParams({ page: '1' });
                  }}
                  placeholder="Tìm theo mã đơn (#...), tên khách, SĐT, hoặc sản phẩm..."
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2A5C4A]/25 focus:border-[#2A5C4A] dark:focus:border-[#C9A84C]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={onlyMyScope}
                    onChange={(e) => setOnlyMyScope(e.target.checked)}
                    className="w-4 h-4 accent-[#1A3A2C] dark:accent-[#C9A84C] rounded border-slate-300 dark:border-slate-600 focus:ring-[#2A5C4A]"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Phạm vi (Đơn được phân công)
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={onlyMyAssigned}
                    onChange={(e) => setOnlyMyAssigned(e.target.checked)}
                    className="w-4 h-4 accent-[#1A3A2C] dark:accent-[#C9A84C] rounded border-slate-300 dark:border-slate-600 focus:ring-[#2A5C4A]"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#2A5C4A] dark:text-[#DEC47E]" />
                    <span>Đơn của tôi</span>
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setOnlyExceptions(!onlyExceptions)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-semibold border transition cursor-pointer ${
                    onlyExceptions
                      ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
                      : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Chỉ xem có sự cố</span>
                </button>

                <button
                  type="button"
                  onClick={fetchOrders}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Làm mới danh sách"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Làm mới</span>
                </button>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center space-x-1 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800">
              {STATUS_TABS.map((tab) => {
                const count = countsByStatus?.[tab.key] ?? (tab.key === 'all' ? totalItems : 0);
                const isActive = currentTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => updateUrlParams({ status: tab.key, page: '1' })}
                    className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition flex items-center space-x-2 cursor-pointer ${
                      isActive
                        ? 'bg-[#1A3A2C] dark:bg-[#2A5C4A] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-[#C9A84C]/25 text-[#DEC47E]'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orders List Table */}
          <div className="bg-white dark:bg-[#131B17] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Mã đơn &amp; Thời gian</th>
                    <th className="py-3 px-4">Khách hàng &amp; Khu vực</th>
                    <th className="py-3 px-4">Sản phẩm</th>
                    <th className="py-3 px-4 text-right">Tổng tiền</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4">Vendor &amp; SLA</th>
                    <th className="py-3 px-4">Nhân viên vận chuyển</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1A3A2C] dark:text-[#DEC47E] mb-2" />
                        <p className="font-medium text-slate-600 dark:text-slate-300">
                          Đang tải danh sách đơn hàng...
                        </p>
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="font-medium text-slate-600 dark:text-slate-300">
                          Không tìm thấy đơn hàng nào phù hợp
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Thử thay đổi bộ lọc trạng thái, phạm vi hoặc từ khóa tìm kiếm
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const statusBadge = STATUS_BADGE[order.status] || STATUS_BADGE.pending;
                      const carrierEmp = order.assignedCarrier;

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                        >
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => openDetailModal(order)}
                              className="font-mono font-bold text-xs text-[#1A3A2C] dark:text-[#DEC47E] hover:text-[#2A5C4A] dark:hover:text-[#F0D78C] hover:underline flex items-center gap-0.5 group cursor-pointer"
                              title={`Mã đầy đủ: ${order.orderCode || order.id} - Nhấp để xem chi tiết`}
                            >
                              <span className="text-slate-400 group-hover:text-[#2A5C4A] dark:group-hover:text-[#DEC47E]">
                                #
                              </span>
                              <span>{formatShortOrderCode(order.orderCode || order.id)}</span>
                            </button>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {new Date(order.createdAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              • {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                            {order.exception && (
                              <div className="mt-1 inline-flex items-center space-x-1 text-[10px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/35 px-1.5 py-0.5 rounded font-bold">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span className="line-clamp-1">{order.exception.title}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800 dark:text-white">
                              {order.receiverName}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {order.receiverPhone}
                            </p>
                            <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {order.region === 'region_north'
                                ? 'Miền Bắc'
                                : order.region === 'region_central'
                                  ? 'Miền Trung'
                                  : 'Miền Nam'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="font-medium text-slate-800 dark:text-slate-100 line-clamp-1">
                              {order.details?.[0]?.productName || 'Sản phẩm'}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {order.details?.length > 1
                                ? `+ ${order.details.length - 1} sản phẩm khác`
                                : `${order.details?.[0]?.colorName || ''} • Size ${order.details?.[0]?.sizeName || ''}`}
                            </p>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {order.totalAmount?.toLocaleString()} đ
                            </p>
                            <span
                              className={`text-[10px] uppercase font-mono ${
                                order.paymentMethod === 'cod'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {order.paymentMethod}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-full border ${statusBadge.class}`}
                            >
                              {statusBadge.label}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {order.orderVendors?.length > 0 || order.assignedVendor ? (
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-white text-[11px] flex items-center space-x-1">
                                  <Store className="w-3 h-3 text-[#2A5C4A] dark:text-[#DEC47E] shrink-0" />
                                  <span className="line-clamp-1">
                                    {order.orderVendors?.[0]?.name || order.assignedVendor?.name}
                                  </span>
                                </p>
                                <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                  <span className="text-[10px] text-[#1A3A2C] dark:text-[#8BBAA1] bg-[#EEF5F1] dark:bg-[#1A3A2C]/50 px-1 rounded font-semibold">
                                    {order.orderVendors?.[0]?.code || order.assignedVendor?.code}
                                  </span>
                                  {order.orderVendors?.length > 1 && (
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded font-medium">
                                      +{order.orderVendors.length - 1} đối tác
                                    </span>
                                  )}
                                  {order.isVendorSlaWarning && (
                                    <span
                                      className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/35 px-1.5 py-0.2 rounded-full"
                                      title="Đơn đã bàn giao cho Vendor quá 6 giờ nhưng chưa xuất kho"
                                    >
                                      <Clock className="w-2.5 h-2.5" />
                                      Quá SLA &gt;6h ({Math.floor(order.vendorElapsedHours)}h)
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Chưa bàn giao
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {carrierEmp ? (
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-white text-[11px] flex items-center space-x-1">
                                  <Truck className="w-3.5 h-3.5 text-[#2A5C4A] dark:text-[#DEC47E] shrink-0" />
                                  <span className="line-clamp-1">{carrierEmp.fullName}</span>
                                </p>
                                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                  {carrierEmp.employeeCode && (
                                    <span className="text-[10px] text-[#8C6B1F] dark:text-[#DEC47E] bg-[#FBF7EC] dark:bg-[#C9A84C]/15 px-1 py-0.2 rounded font-mono font-medium">
                                      {carrierEmp.employeeCode}
                                    </span>
                                  )}
                                  {carrierEmp.department && (
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded">
                                      {carrierEmp.department}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="inline-block text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/35 px-1.5 py-0.5 rounded">
                                Chưa phân công bưu tá
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                type="button"
                                onClick={() => openDetailModal(order)}
                                title="Xem chi tiết"
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#1A3A2C] dark:hover:text-[#DEC47E] hover:bg-[#EEF5F1] dark:hover:bg-[#1A3A2C]/50 rounded-lg transition cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {order.status === 'pending' && canDispatch && (
                                <button
                                  type="button"
                                  onClick={() => openActionModal(order, 'confirm')}
                                  title="Duyệt đơn hàng hợp lệ"
                                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition flex items-center space-x-1 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Duyệt đơn</span>
                                </button>
                              )}

                              {order.status === 'pending' && canHandleException && (
                                <button
                                  type="button"
                                  onClick={() => openActionModal(order, 'reject')}
                                  title="Từ chối theo quy tắc ngoại lệ"
                                  className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 rounded-lg transition cursor-pointer"
                                >
                                  <AlertOctagon className="w-4 h-4" />
                                </button>
                              )}

                              {order.status === 'confirmed' && canDispatch && (
                                <button
                                  type="button"
                                  onClick={() => openActionModal(order, 'transfer')}
                                  title="Chuyển đơn cho đối tác Vendor chuẩn bị hàng"
                                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#2A5C4A] dark:hover:bg-[#35755B] rounded-lg shadow-xs transition flex items-center space-x-1 cursor-pointer"
                                >
                                  <Send className="w-3.5 h-3.5 text-[#DEC47E]" />
                                  <span>Chuyển Vendor</span>
                                </button>
                              )}

                              {canHandleException && (
                                <button
                                  type="button"
                                  onClick={() => openActionModal(order, 'exception')}
                                  title="Xử lý / Báo sự cố ngoại lệ"
                                  className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/15 rounded-lg transition cursor-pointer"
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                </button>
                              )}
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

          {/* Pagination Bar */}
          <div className="bg-white dark:bg-[#131B17] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Hiển thị trang{' '}
              <span className="font-bold text-slate-800 dark:text-white">{page}</span> /{' '}
              <span className="font-bold text-slate-800 dark:text-white">{totalPages}</span> (Tổng
              cộng{' '}
              <span className="font-bold text-[#1A3A2C] dark:text-[#DEC47E]">{totalItems}</span> đơn
              hàng)
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => page > 1 && updateUrlParams({ page: String(page - 1) })}
                disabled={page <= 1 || loading}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trang trước</span>
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && page > 3) {
                    pageNum = page - 2 + i;
                    if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => updateUrlParams({ page: String(pageNum) })}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                        page === pageNum
                          ? 'bg-[#1A3A2C] dark:bg-[#2A5C4A] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => page < totalPages && updateUrlParams({ page: String(page + 1) })}
                disabled={page >= totalPages || loading}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <span>Trang sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* SUB-VIEW 2: THEO DÕI SLA VENDOR */}
      {activeView === 'sla' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#0E2219] via-[#1A3A2C] to-[#2A5C4A] border border-[#2A5C4A]/60 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-[#DEC47E] text-xs font-bold uppercase tracking-wider mb-1">
                <Truck className="w-4 h-4" />
                <span>Giám sát tiến độ xuất kho đối tác</span>
              </div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Theo Dõi Tiến Độ Vendor &amp; Cam Kết SLA
              </h2>
              <p className="text-xs text-[#C6DCD1] mt-1 max-w-2xl leading-relaxed">
                Giám sát thời gian chuẩn bị kiện hàng kể từ lúc chuyển sang trạng thái Đang đóng
                gói. Tự động cảnh báo các đơn chờ xuất kho quá 6 giờ.
              </p>
            </div>
            <div className="flex items-center space-x-4 bg-[#08130E]/45 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#C9A84C]/30 shrink-0">
              <div className="text-center">
                <p className="text-2xl font-black text-white">{slaVendorOrders.length}</p>
                <p className="text-[10px] text-[#B9D6C6]">Đơn tại Vendor</p>
              </div>
              <div className="h-8 w-px bg-white/15" />
              <div className="text-center">
                <p className="text-2xl font-black text-rose-300">
                  {slaVendorOrders.filter((o) => getSlaBadgeMeta(o).isOverdue).length}
                </p>
                <p className="text-[10px] text-rose-200">Cảnh báo / Quá SLA</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#131B17] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={slaSearch}
                onChange={(e) => setSlaSearch(e.target.value)}
                placeholder="Tìm theo kho Vendor, mã đơn hoặc tên khách hàng..."
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2A5C4A]/25 focus:border-[#2A5C4A]"
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Hiển thị{' '}
              <span className="font-bold text-slate-800 dark:text-white">
                {slaVendorOrders.length}
              </span>{' '}
              đơn trong trang hiện tại
            </div>
          </div>

          {slaVendorOrders.length === 0 ? (
            <div className="bg-white dark:bg-[#131B17] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
              <Store className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-semibold text-slate-600 dark:text-slate-300 text-xs">
                Không có đơn hàng nào đang chờ theo dõi SLA tại Vendor
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slaVendorOrders.map((order) => {
                const sla = getSlaBadgeMeta(order);
                return (
                  <div
                    key={order.id}
                    className={`bg-white dark:bg-[#131B17] rounded-2xl border transition p-5 space-y-4 shadow-2xs ${
                      sla.isOverdue
                        ? 'border-rose-300 dark:border-rose-500/50 ring-1 ring-rose-200 dark:ring-rose-500/30 bg-rose-50/10 dark:bg-rose-950/15'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="font-mono font-bold text-[#1A3A2C] dark:text-[#DEC47E] text-sm"
                            title={order.orderCode}
                          >
                            #{formatShortOrderCode(order.orderCode || order.id)}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${sla.color}`}
                          >
                            {sla.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Khách hàng:{' '}
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {order.receiverName}
                          </span>{' '}
                          ({order.receiverPhone})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openDetailModal(order)}
                        className="p-1.5 text-slate-400 hover:text-[#1A3A2C] dark:hover:text-[#DEC47E] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        title="Xem chi tiết đơn"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/70 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-white">
                          <Store className="w-4 h-4 text-[#2A5C4A] dark:text-[#DEC47E]" />
                          <span>{order.assignedVendor?.name || 'Tổng kho MIVA'}</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {order.assignedVendor?.code || 'VND-SYS'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                        <span>
                          Trạng thái:{' '}
                          <strong className="text-slate-700 dark:text-slate-200">
                            {order.assignedVendor?.vendorStatus || 'Đang đóng gói'}
                          </strong>
                        </span>
                        <span>
                          Bàn giao:{' '}
                          {order.assignedVendor?.transferredAt
                            ? new Date(order.assignedVendor.transferredAt).toLocaleTimeString(
                                'vi-VN',
                                { hour: '2-digit', minute: '2-digit' },
                              )
                            : 'Mới gán'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <img
                        src={order.details?.[0]?.imageUrl}
                        alt={order.details?.[0]?.productName}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-white line-clamp-1">
                          {order.details?.[0]?.productName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {order.details?.[0]?.quantity || 1} sản phẩm • Tổng tiền:{' '}
                          {order.totalAmount?.toLocaleString()} đ
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs gap-2">
                      <button
                        type="button"
                        onClick={() => handleUrgeVendor(order)}
                        disabled={urgingOrderId === order.id}
                        className={`px-3 py-1.5 font-semibold rounded-lg transition flex items-center space-x-1 cursor-pointer ${
                          urgedSuccessMap[order.id]
                            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/35'
                            : 'text-[#1A3A2C] dark:text-[#DEC47E] bg-[#EEF5F1] dark:bg-[#1A3A2C]/50 hover:bg-[#DCEBE2] dark:hover:bg-[#1A3A2C]/80'
                        }`}
                      >
                        {urgedSuccessMap[order.id] ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Đã gửi đốc thúc Shop!</span>
                          </>
                        ) : (
                          <>
                            <Phone className="w-3.5 h-3.5" />
                            <span>
                              {urgingOrderId === order.id
                                ? 'Đang gửi...'
                                : 'Đốc thúc kho xuất hàng'}
                            </span>
                          </>
                        )}
                      </button>

                      {canHandleException && (
                        <button
                          type="button"
                          onClick={() => openActionModal(order, 'exception')}
                          className="px-3 py-1.5 font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/15 hover:bg-rose-100 dark:hover:bg-rose-500/25 rounded-lg transition flex items-center space-x-1 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Báo sự cố SLA</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: NHẬT KÝ THAO TÁC TRANG HIỆN TẠI */}
      {activeView === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#131B17] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Tìm theo mã đơn, nhân viên thực hiện hoặc ghi chú..."
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2A5C4A]/25 focus:border-[#2A5C4A]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium mr-1">Vai trò:</span>
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'employee', label: 'Nhân viên' },
                { key: 'vendor', label: 'Vendor' },
                { key: 'admin', label: 'Admin' },
                { key: 'client', label: 'Khách hàng' },
              ].map((act) => (
                <button
                  key={act.key}
                  type="button"
                  onClick={() => setAuditActorFilter(act.key)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    auditActorFilter === act.key
                      ? 'bg-[#1A3A2C] dark:bg-[#2A5C4A] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#131B17] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs divide-y divide-slate-100 dark:divide-slate-800">
            {auditHistories.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <History className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="font-semibold text-slate-600 dark:text-slate-300 text-xs">
                  Chưa có nhật ký trạng thái nào trong trang hiện tại
                </p>
              </div>
            ) : (
              auditHistories.map((item, idx) => (
                <div
                  key={item.id || `${item.orderId}-${idx}`}
                  className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="font-mono font-bold text-[#1A3A2C] dark:text-[#DEC47E] bg-[#EEF5F1] dark:bg-[#1A3A2C]/50 px-2 py-0.5 rounded border border-[#B9D6C6] dark:border-[#2A5C4A]"
                        title={item.orderCode}
                      >
                        #{formatShortOrderCode(item.orderCode || item.orderId)}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                          item.actorRole?.includes('Nhân viên')
                            ? 'bg-[#EEF5F1] text-[#1A3A2C] border-[#B9D6C6] dark:bg-[#1A3A2C]/50 dark:text-[#8BBAA1] dark:border-[#2A5C4A]'
                            : item.actorRole?.includes('Vendor')
                              ? 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30'
                              : item.actorRole?.includes('Admin')
                                ? 'bg-[#FBF7EC] text-[#8C6B1F] border-[#E6D39A] dark:bg-[#C9A84C]/15 dark:text-[#DEC47E] dark:border-[#C9A84C]/35'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                        }`}
                      >
                        {item.actorRole || 'Hệ thống'}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-white">
                        {item.actorName || 'Thành viên hệ thống'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span>Chuyển trạng thái:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase font-mono">
                        {item.fromStatus || 'Khởi tạo'}
                      </span>
                      <span>→</span>
                      <span className="font-bold text-[#1A3A2C] dark:text-[#DEC47E] uppercase font-mono">
                        {item.toStatus}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-700/70 mt-1 max-w-3xl">
                      &ldquo;{item.note || 'Không có ghi chú'}&rdquo;
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-slate-400">
                      {new Date(item.createdAt).toLocaleTimeString('vi-VN')} •{' '}
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const found = orders.find((o) => o.id === item.orderId);
                        if (found) openDetailModal(found);
                      }}
                      className="mt-2 text-[#1A3A2C] dark:text-[#DEC47E] hover:text-[#2A5C4A] dark:hover:text-[#F0D78C] font-semibold hover:underline cursor-pointer"
                    >
                      Xem đơn hàng
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={detailOrder}
        user={user}
        isOpen={Boolean(detailOrder)}
        onClose={closeDetailModal}
        onOpenConfirm={(o) => openActionModal(o, 'confirm')}
        onOpenReject={(o) => openActionModal(o, 'reject')}
        onOpenTransfer={(o) => openActionModal(o, 'transfer')}
        onOpenException={(o) => openActionModal(o, 'exception')}
      />

      {/* Unified Order Action Modal */}
      <OrderActionModal
        order={actionModal?.order || null}
        mode={actionModal?.mode || 'confirm'}
        isOpen={Boolean(actionModal?.order)}
        onClose={() => setActionModal(null)}
        onSuccess={fetchOrders}
      />
    </div>
  );
};
