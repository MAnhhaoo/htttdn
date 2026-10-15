import { useState, useEffect, useMemo } from 'react';
import { 
  Boxes, Truck, CheckCircle2, Clock, Ban, Search, RefreshCw, 
  Eye, Printer, AlertTriangle, Package, MapPin, UserCheck, 
  ChevronRight, ArrowRight, ShieldCheck, FileText, Check
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatHelpers';
import { Badge, Button, Input, Modal } from '../../components/ui';

export default function OrderFulfillmentPage() {
  const { user } = useAuth();
  const [vendorOrders, setVendorOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  
  // Modals
  const [packingSlipModal, setPackingSlipModal] = useState(null);
  const [cancelModalItem, setCancelModalItem] = useState(null);
  const [cancelReason, setCancelReason] = useState('Hết hàng tồn kho tại cửa hàng');
  const [cancelNote, setCancelNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchFulfillmentOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getFulfillmentOrders();
      setVendorOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching fulfillment orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFulfillmentOrders();
  }, []);

  // Update Status Action
  const handleUpdateStatus = async (item, newStatus, customNote = '') => {
    let confirmMsg = '';
    if (newStatus === 'processing') {
      confirmMsg = `Xác nhận tiếp nhận và bắt đầu đóng gói kiện hàng ${item.vendorOrderCode}?`;
    } else if (newStatus === 'ready_for_pickup') {
      confirmMsg = `Xác nhận đã đóng gói xong kiện hàng ${item.vendorOrderCode} và sẵn sàng bàn giao cho bưu tá MIVA?`;
    } else if (newStatus === 'shipping') {
      confirmMsg = `Xác nhận bưu tá MIVA đã tiếp nhận kiện hàng ${item.vendorOrderCode} để đi giao?`;
    }

    if (confirmMsg && !window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      await orderService.updateVendorOrderStatus(item.id, newStatus, customNote);
      await fetchFulfillmentOrders();
    } catch (err) {
      console.error('Failed to update vendor order status:', err);
      alert('Không thể cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Cancel Action
  const handleConfirmCancel = async () => {
    if (!cancelModalItem) return;
    const fullNote = `${cancelReason}${cancelNote ? `: ${cancelNote}` : ''}`;
    try {
      setActionLoading(true);
      await orderService.updateVendorOrderStatus(cancelModalItem.id, 'cancelled', fullNote);
      setCancelModalItem(null);
      setCancelNote('');
      await fetchFulfillmentOrders();
    } catch (err) {
      console.error('Failed to cancel vendor order:', err);
      alert('Hủy kiện hàng thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const pending = vendorOrders.filter(vo => vo.status === 'pending' || vo.status === 'confirmed').length;
    const processing = vendorOrders.filter(vo => vo.status === 'processing').length;
    const ready = vendorOrders.filter(vo => vo.status === 'ready_for_pickup').length;
    const shipping = vendorOrders.filter(vo => vo.status === 'shipping' || vo.status === 'delivered').length;
    const cancelled = vendorOrders.filter(vo => vo.status === 'cancelled').length;
    return { pending, processing, ready, shipping, cancelled, total: vendorOrders.length };
  }, [vendorOrders]);

  // Filtered List
  const filteredOrders = useMemo(() => {
    return vendorOrders.filter(vo => {
      // Tab filter
      let matchTab = true;
      if (activeTab === 'urgent') {
        matchTab = vo.status === 'confirmed' || vo.status === 'processing';
      } else if (activeTab === 'pending') {
        matchTab = vo.status === 'pending' || vo.status === 'confirmed';
      } else if (activeTab === 'processing') {
        matchTab = vo.status === 'processing';
      } else if (activeTab === 'ready_for_pickup') {
        matchTab = vo.status === 'ready_for_pickup';
      } else if (activeTab === 'shipping') {
        matchTab = vo.status === 'shipping';
      } else if (activeTab === 'delivered') {
        matchTab = vo.status === 'delivered';
      } else if (activeTab === 'cancelled') {
        matchTab = vo.status === 'cancelled';
      }

      if (!matchTab) return false;

      // Search filter
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const matchCode = (vo.vendorOrderCode || '').toLowerCase().includes(q);
      const matchOrderCode = (vo.order?.orderCode || '').toLowerCase().includes(q);
      const matchTracking = (vo.shipment?.trackingNumber || '').toLowerCase().includes(q);
      const matchItems = (vo.details || []).some(d => (d.productName || '').toLowerCase().includes(q));

      return matchCode || matchOrderCode || matchTracking || matchItems;
    });
  }, [vendorOrders, activeTab, search]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Badge variant="warning">Chờ tiếp nhận</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Đang đóng gói</Badge>;
      case 'ready_for_pickup':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Sẵn sàng gửi ship</Badge>;
      case 'shipping':
        return <Badge variant="info">Đang vận chuyển</Badge>;
      case 'delivered':
        return <Badge variant="success">Giao thành công</Badge>;
      case 'cancelled':
        return <Badge variant="error">Đã hủy</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Boxes className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Đóng Gói &amp; Xuất Kho Điều Phối (Fulfillment)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Đơn hàng được Admin và Nhân viên MIVA kiểm duyệt chuyển sang cho Shop. Đóng gói xong hãy bấm gửi hàng cho bưu tá MIVA tiếp nhận.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <Button
            variant="outline"
            onClick={fetchFulfillmentOrders}
            disabled={loading}
            className="flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới danh sách
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div 
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-xl border transition cursor-pointer ${activeTab === 'pending' ? 'bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400/50'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Chờ tiếp nhận</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{stats.pending}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Admin/NV vừa chuyển qua</p>
        </div>

        <div 
          onClick={() => setActiveTab('processing')}
          className={`p-4 rounded-xl border transition cursor-pointer ${activeTab === 'processing' ? 'bg-blue-500/10 border-blue-500/40 ring-2 ring-blue-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400/50'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Đang đóng gói</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{stats.processing}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Shop đang chuẩn bị hàng</p>
        </div>

        <div 
          onClick={() => setActiveTab('ready_for_pickup')}
          className={`p-4 rounded-xl border transition cursor-pointer ${activeTab === 'ready_for_pickup' ? 'bg-emerald-500/10 border-emerald-500/40 ring-2 ring-emerald-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400/50'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Sẵn sàng gửi ship</span>
            <Truck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{stats.ready}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Đã đóng gói xong</p>
        </div>

        <div 
          onClick={() => setActiveTab('shipping')}
          className={`p-4 rounded-xl border transition cursor-pointer ${activeTab === 'shipping' ? 'bg-indigo-500/10 border-indigo-500/40 ring-2 ring-indigo-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400/50'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Đang vận chuyển</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-indigo-600 mt-2">{stats.shipping}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Bưu tá MIVA đang giao</p>
        </div>

        <div 
          onClick={() => setActiveTab('cancelled')}
          className={`p-4 rounded-xl border transition cursor-pointer ${activeTab === 'cancelled' ? 'bg-rose-500/10 border-rose-500/40 ring-2 ring-rose-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-400/50'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Đã hủy kiện</span>
            <Ban className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">{stats.cancelled}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Hết hàng / Sự cố</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3.5 shadow-xs">
        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          {[
            { id: 'all', label: 'Tất cả kiện hàng', count: stats.total },
            { id: 'urgent', label: '⚡ Cần xử lý gấp', count: stats.pending + stats.processing, highlight: true },
            { id: 'pending', label: 'Chờ tiếp nhận', count: stats.pending },
            { id: 'processing', label: 'Đang đóng gói', count: stats.processing },
            { id: 'ready_for_pickup', label: 'Sẵn sàng gửi ship', count: stats.ready },
            { id: 'shipping', label: 'Đang giao', count: stats.shipping },
            { id: 'cancelled', label: 'Đã hủy', count: stats.cancelled },
          ].map(tab => (
            <button
              key={tab.id}
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
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
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
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">Không có kiện hàng nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Không tìm thấy kiện hàng nào phù hợp với bộ lọc hiện tại. Khi Admin hoặc Nhân viên điều phối đơn hàng, danh sách sẽ tự động hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(vo => {
            const isPendingOrConfirmed = vo.status === 'pending' || vo.status === 'confirmed';
            const isProcessing = vo.status === 'processing';
            const isReadyForPickup = vo.status === 'ready_for_pickup';
            const isCancelled = vo.status === 'cancelled';
            const isCompleted = vo.status === 'delivered';
            const isShipping = vo.status === 'shipping';

            const subtotal = Number(vo.subtotalAmount || 0);

            return (
              <div 
                key={vo.id} 
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all hover:shadow-md"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase">Mã đơn hàng:</span>
                      <span className="font-mono font-bold text-sm text-indigo-700 dark:text-indigo-300">
                        #{vo.order?.orderCode}
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
                      Điều phối bởi MIVA Ops
                    </span>
                    {getStatusBadge(vo.status)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Products items (7 cols) */}
                  <div className="lg:col-span-7 space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-indigo-500" />
                      Sản phẩm cần đóng gói của Shop ({(vo.details || []).length} mục)
                    </h4>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 p-2">
                      {(vo.details || []).map((item, idx) => (
                        <div key={item.id || idx} className="py-2.5 first:pt-1 last:pb-1 flex items-center gap-3">
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
                              {item.colorName ? `Màu: ${item.colorName}` : ''} {item.sizeName ? `• Size: ${item.sizeName}` : ''}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-xs text-slate-500">
                              {formatCurrency(item.price)} <span className="font-bold text-indigo-600 dark:text-indigo-400">x{item.quantity}</span>
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
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Ghi chú kiện:</span> {vo.notes}
                      </div>
                    )}
                  </div>

                  {/* Right: Logistics & Action box (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-5 space-y-4">
                    {/* Shipping & Courier info */}
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
                          <span className="text-slate-500">Tổng thu tiền hàng:</span>
                          <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="space-y-2 pt-2">
                      {isPendingOrConfirmed && (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleUpdateStatus(vo, 'processing')}
                            disabled={actionLoading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 flex items-center justify-center gap-2"
                          >
                            <Boxes className="w-4 h-4" />
                            Tiếp nhận &amp; Bắt đầu đóng gói
                          </Button>

                          <Button
                            variant="danger"
                            onClick={() => setCancelModalItem(vo)}
                            disabled={actionLoading}
                            className="text-xs py-2.5 px-3 flex items-center justify-center gap-1.5"
                            title="Hủy kiện nếu hết hàng"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Hủy
                          </Button>
                        </div>
                      )}

                      {isProcessing && (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleUpdateStatus(vo, 'ready_for_pickup')}
                            disabled={actionLoading}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 flex items-center justify-center gap-2 shadow-xs"
                          >
                            <Check className="w-4 h-4" />
                            Đã đóng gói xong - Gửi hàng cho Ship
                          </Button>

                          <Button
                            variant="danger"
                            onClick={() => setCancelModalItem(vo)}
                            disabled={actionLoading}
                            className="text-xs py-2.5 px-3 flex items-center justify-center gap-1.5"
                            title="Hủy kiện nếu phát hiện lỗi"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Hủy
                          </Button>
                        </div>
                      )}

                      {isReadyForPickup && (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleUpdateStatus(vo, 'shipping')}
                            disabled={actionLoading}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 flex items-center justify-center gap-2"
                          >
                            <Truck className="w-4 h-4" />
                            Xác nhận bưu tá đã lấy hàng
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => setCancelModalItem(vo)}
                            disabled={actionLoading}
                            className="text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 py-2.5 px-3"
                          >
                            Hủy kiện
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

                      {/* Packing Slip Button */}
                      <Button
                        variant="ghost"
                        onClick={() => setPackingSlipModal(vo)}
                        className="w-full text-xs text-slate-500 hover:text-indigo-600 py-1.5 flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        In Phiếu Đóng Gói (Packing Slip)
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalItem && (
        <Modal
          isOpen={!!cancelModalItem}
          onClose={() => setCancelModalItem(null)}
          title={`Hủy Kiện Hàng #${cancelModalItem.vendorOrderCode}`}
          maxWidth="max-w-md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="ghost" onClick={() => setCancelModalItem(null)} disabled={actionLoading}>
                Quay lại
              </Button>
              <Button 
                variant="danger" 
                onClick={handleConfirmCancel} 
                disabled={actionLoading}
                className="flex items-center gap-1.5"
              >
                <Ban className="w-4 h-4" />
                {actionLoading ? 'Đang hủy...' : 'Xác nhận hủy kiện'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Khi hủy kiện hàng này, số lượng tồn kho của các sản phẩm bên trong sẽ được tự động cộng trả lại kho của shop.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Lý do hủy kiện hàng:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Hết hàng tồn kho tại cửa hàng">Hết hàng tồn kho tại cửa hàng</option>
                <option value="Sản phẩm bị lỗi hỏng khi kiểm tra">Sản phẩm bị lỗi hỏng khi kiểm tra</option>
                <option value="Không kịp đóng gói trước thời hạn bàn giao">Không kịp đóng gói trước thời hạn bàn giao</option>
                <option value="Không liên hệ được bưu tá / Sự cố kho bãi">Không liên hệ được bưu tá / Sự cố kho bãi</option>
                <option value="Khác">Khác (nhập chi tiết bên dưới)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Ghi chú bổ sung (tùy chọn):
              </label>
              <textarea
                rows={3}
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
                placeholder="Nhập thông tin chi tiết giải trình cho Admin/Khách hàng..."
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Printable Packing Slip Modal */}
      {packingSlipModal && (
        <Modal
          isOpen={!!packingSlipModal}
          onClose={() => setPackingSlipModal(null)}
          title="Phiếu Đóng Gói & Bàn Giao Kiện Hàng MIVA"
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400">
                MIVA Logistics Handover Standard Form
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setPackingSlipModal(null)}>
                  Đóng
                </Button>
                <Button 
                  onClick={() => window.print()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  In Phiếu Đóng Gói
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-slate-800 dark:text-slate-100 p-2 print:p-0">
            {/* Slip Header */}
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">PHIẾU ĐÓNG GÓI KIỆN HÀNG</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">SÀN THƯƠNG MẠI ĐIỆN TỬ MIVA</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-sm text-indigo-700">{packingSlipModal.vendorOrderCode}</p>
                <p className="text-[11px] text-slate-400">Đơn gốc: #{packingSlipModal.order?.orderCode}</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="space-y-1">
                <p><span className="text-slate-500">Đơn vị gửi:</span> <span className="font-bold">{user?.storeName || 'Shop đối tác MIVA'}</span></p>
                <p><span className="text-slate-500">Mã vận đơn:</span> <span className="font-mono font-bold text-slate-900 dark:text-white">{packingSlipModal.shipment?.trackingNumber || 'VNPOST-MIVA'}</span></p>
                <p><span className="text-slate-500">Ngày in phiếu:</span> {new Date().toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="space-y-1">
                <p><span className="text-slate-500">Đơn vị vận chuyển:</span> <span className="font-bold">MIVA Express (Nội bộ)</span></p>
                <p><span className="text-slate-500">Bưu tá tiếp nhận:</span> {packingSlipModal.shipment?.carrier?.fullName || 'Bưu tá MIVA'}</p>
                <p><span className="text-slate-500">Địa chỉ giao:</span> Khách hàng MIVA (Bảo mật)</p>
              </div>
            </div>

            {/* Items checklist */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Danh mục hàng hóa đóng gói:</h4>
              <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-700">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2 w-8 text-center">✓</th>
                    <th className="p-2">Tên sản phẩm</th>
                    <th className="p-2">Phân loại</th>
                    <th className="p-2 text-center">SL</th>
                    <th className="p-2 text-right">Đơn giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {(packingSlipModal.details || []).map((d, i) => (
                    <tr key={d.id || i}>
                      <td className="p-2 text-center">
                        <div className="w-4 h-4 border border-slate-400 rounded-sm mx-auto"></div>
                      </td>
                      <td className="p-2 font-medium">{d.productName}</td>
                      <td className="p-2 text-slate-500">{d.colorName} • Size {d.sizeName}</td>
                      <td className="p-2 text-center font-bold">{d.quantity}</td>
                      <td className="p-2 text-right">{formatCurrency(d.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Blocks */}
            <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300">ĐẠI DIỆN SHOP ĐÓNG GÓI</p>
                <p className="text-[10px] text-slate-400 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
                <div className="h-16"></div>
              </div>
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300">BƯU TÁ MIVA NHẬN KIỆN</p>
                <p className="text-[10px] text-slate-400 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
                <div className="h-16"></div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
