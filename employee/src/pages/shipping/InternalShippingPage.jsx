import React, { useState, useEffect, useCallback } from 'react';
import { 
  Truck, Search, Filter, RefreshCw, CheckCircle2, Clock, 
  MapPin, Phone, User, Package, AlertTriangle, ArrowRight, 
  ChevronRight, Calendar, FileText, Check, ShieldAlert, X
} from 'lucide-react';
import { shippingApi, ordersApi } from '../../api/axiosClient';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_CONFIG = {
  pending: { label: 'Chờ tiếp nhận', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  assigned: { label: 'Đã phân công', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  picking_up: { label: 'Đang lấy hàng', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  in_transit: { label: 'Đang luân chuyển', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  out_for_delivery: { label: 'Đang giao hàng', badge: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  delivered: { label: 'Giao thành công', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  failed: { label: 'Giao thất bại', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
  returned: { label: 'Đã hoàn hàng', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const InternalShippingPage = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  // Modals state
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState('in_transit');
  const [locationText, setLocationText] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [failedReason, setFailedReason] = useState('');
  const [updating, setUpdating] = useState(false);

  // Escalation to Admin Modal
  const [escalateShipment, setEscalateShipment] = useState(null);
  const [escalateReason, setEscalateReason] = useState('Khách từ chối nhận / Bom hàng');
  const [escalatePriority, setEscalatePriority] = useState('high');
  const [escalateNote, setEscalateNote] = useState('');
  const [escalating, setEscalating] = useState(false);

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        itemPerPage: 50,
        ...(search ? { q: search } : {}),
        ...(activeTab !== 'all' ? { status: activeTab } : {}),
      };

      const res = await shippingApi.getShipments(params);
      const list = res.list || res.data?.list || (Array.isArray(res) ? res : []);
      setShipments(list);
      if (res?.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Error fetching internal shipments:', err);
    } finally {
      setLoading(false);
    }
  }, [search, activeTab]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  useEffect(() => {
    window.addEventListener('miva:shipping', fetchShipments);
    return () => window.removeEventListener('miva:shipping', fetchShipments);
  }, [fetchShipments]);

  // Handle open update modal
  const handleOpenUpdate = (shipment, suggestedStatus) => {
    setSelectedShipment(shipment);
    const targetStatus = suggestedStatus || 'in_transit';
    setNextStatus(targetStatus);

    let defaultLoc = 'Hub Logistics Nội bộ MIVA';
    let defaultDesc = '';

    if (targetStatus === 'picking_up') {
      defaultLoc = shipment.vendorOrder?.vendor?.storeName || 'Kho Vendor';
      defaultDesc = 'Bưu tá đã tiếp nhận đơn và đang tới lấy hàng tại kho Vendor';
    } else if (targetStatus === 'in_transit') {
      defaultLoc = 'Hub Logistics Phân loại MIVA';
      defaultDesc = 'Đã lấy hàng thành công từ Vendor, đang luân chuyển qua Hub phân loại';
    } else if (targetStatus === 'out_for_delivery') {
      defaultLoc = shipment.shippingAddress ? `Tuyến: ${shipment.shippingAddress.split(',').slice(-2).join(',').trim()}` : 'Tuyến giao hàng';
      defaultDesc = 'Đã xuất kho Hub, bưu tá đang trên đường đi giao đến người nhận';
    } else if (targetStatus === 'delivered') {
      defaultLoc = shipment.shippingAddress || 'Địa chỉ khách hàng';
      defaultDesc = 'Đã giao kiện hàng thành công cho người nhận';
    } else if (targetStatus === 'failed') {
      defaultLoc = shipment.shippingAddress || 'Địa chỉ khách hàng';
      defaultDesc = 'Giao hàng không thành công';
    }

    setLocationText(defaultLoc);
    setDescriptionText(defaultDesc);
    setFailedReason('');
    setIsUpdateOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await shippingApi.updateStatus(selectedShipment.id, {
        status: nextStatus,
        location: locationText,
        description: descriptionText,
        failedReason: nextStatus === 'failed' ? failedReason : undefined,
      });
      setIsUpdateOpen(false);
      fetchShipments();
    } catch (err) {
      alert(`Lỗi cập nhật trạng thái vận chuyển: ${err.response?.data?.message || err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Handle open escalation modal to report failed delivery and request Admin cancellation
  const handleOpenEscalate = (shipment) => {
    setEscalateShipment(shipment);
    setEscalateReason(shipment.failedReason || 'Khách từ chối nhận / Bom hàng');
    setEscalatePriority('high');
    setEscalateNote(shipment.failedReason ? `Bưu tá báo sự cố: ${shipment.failedReason}` : '');
  };

  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!escalateShipment?.orderId) {
      alert('Không tìm thấy thông tin đơn hàng gốc của kiện hàng này');
      return;
    }
    try {
      setEscalating(true);
      const note = `[Chuyển tiếp Admin xử lý] Kiện ${escalateShipment.trackingNumber || escalateShipment.id}. Mức độ: ${escalatePriority}. Lý do: ${escalateReason}. Chi tiết: ${escalateNote}`;
      await ordersApi.updateStatus(escalateShipment.orderId, {
        status: escalateShipment.order?.status || 'shipping',
        note,
        notifyTarget: 'admin',
        title: `[Báo cáo sự cố bưu tá] Vận đơn #${escalateShipment.trackingNumber || escalateShipment.id}`,
      });
      alert('Đã lập báo cáo sự cố & gửi thông báo thành công đến Admin!');
      setEscalateShipment(null);
      fetchShipments();
    } catch (err) {
      alert(`Lỗi chuyển tiếp sự cố: ${err.response?.data?.message || err.message}`);
    } finally {
      setEscalating(false);
    }
  };

  // Open Detail / Timeline Modal
  const handleOpenDetail = async (shipment) => {
    try {
      const full = await shippingApi.getShipment(shipment.id);
      setSelectedShipment(full);
      setIsDetailOpen(true);
    } catch (err) {
      alert('Không thể tải chi tiết vận đơn');
    }
  };

  // Quick Stats from server summary or loaded array
  const pendingCount =
    summary?.pending ?? shipments.filter((s) => s.status === 'pending').length;
  const inTransitCount =
    summary?.inTransit ??
    shipments.filter(
      (s) =>
        s.status === 'assigned' ||
        s.status === 'picking_up' ||
        s.status === 'in_transit' ||
        s.status === 'out_for_delivery',
    ).length;
  const deliveredCount =
    summary?.delivered ?? shipments.filter((s) => s.status === 'delivered').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-7 h-7 text-blue-600" />
            Điều Phối & Vận Chuyển Nội Bộ (MIVA Logistics)
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Tiếp nhận kiện hàng từ Vendor, luân chuyển qua Hub phân loại và giao tận tay khách hàng
          </p>
        </div>

        <button
          onClick={fetchShipments}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 shadow-xs transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Chờ điều phối</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Đang luân chuyển / Giao</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{inTransitCount}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Giao thành công</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{deliveredCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'pending', label: 'Chờ tiếp nhận' },
            { key: 'picking_up', label: 'Lấy hàng Vendor' },
            { key: 'in_transit', label: 'Luân chuyển Hub' },
            { key: 'out_for_delivery', label: 'Đang giao hàng' },
            { key: 'delivered', label: 'Thành công' },
            { key: 'failed', label: 'Sự cố' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã vận đơn, người nhận, ĐT..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>
      </div>

      {/* Shipments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Đang tải danh sách vận đơn...
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Truck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            Không có kiện hàng nào trong danh mục này.
          </div>
        ) : (
          shipments.map((s) => {
            const conf = STATUS_CONFIG[s.status] || { label: s.status, badge: 'bg-slate-100 text-slate-600' };

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:border-blue-300 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                      {s.trackingNumber}
                    </span>
                    <span className="text-xs text-slate-500">
                      Đơn hàng: <span className="font-semibold text-slate-800">{s.order?.orderCode}</span>
                    </span>
                    {s.vendorOrder && (
                      <span className="text-xs text-slate-400">
                        Kiện: <span className="font-medium text-slate-600">{s.vendorOrder.vendorOrderCode}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${conf.badge}`}>
                      {conf.label}
                    </span>
                    <button
                      onClick={() => handleOpenDetail(s)}
                      className="text-xs text-slate-500 hover:text-blue-600 font-medium px-2 py-1 rounded-lg hover:bg-slate-50 transition"
                    >
                      Chi tiết &amp; Nhật ký
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Vendor / Pickup info */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">1. Điểm lấy hàng (Vendor)</p>
                    <p className="font-semibold text-slate-800">
                      {s.vendorOrder?.vendor?.storeName || 'Kho Tổng Miva'}
                    </p>
                    <p className="text-slate-500">{s.vendorOrder?.vendor?.fullName || 'Nhà cung cấp đối tác'}</p>
                  </div>

                  {/* Customer / Delivery info */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">2. Người nhận &amp; Địa chỉ giao</p>
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.receiverName || 'Khách hàng'}</span>
                      <span className="text-slate-400 font-normal">({s.receiverPhone})</span>
                    </p>
                    <p className="text-slate-500 truncate" title={s.shippingAddress}>
                      {s.shippingAddress}
                    </p>
                  </div>

                  {/* Assigned Carrier */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">3. Nhân viên phụ trách</p>
                    {s.carrier ? (
                      <div>
                        <p className="font-semibold text-slate-800">{s.carrier.fullName}</p>
                        <p className="text-slate-500 font-mono text-[11px]">
                          {s.carrier.employeeCode} {s.carrier.phone ? `• ${s.carrier.phone}` : ''}
                        </p>
                      </div>
                    ) : (
                      <p className="text-amber-600 font-medium">Chưa có người tiếp nhận</p>
                    )}
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Sự kiện gần nhất: {s.events?.[0]?.description || 'Chưa có cập nhật'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {(s.status === 'pending' || s.status === 'assigned') && (
                      <button
                        onClick={() => handleOpenUpdate(s, 'picking_up')}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                      >
                        Tiếp nhận &amp; Bắt đầu lấy hàng (Vendor)
                      </button>
                    )}

                    {s.status === 'picking_up' && (
                      <button
                        onClick={() => handleOpenUpdate(s, 'in_transit')}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                      >
                        Nhập kho Hub &amp; Luân chuyển
                      </button>
                    )}

                    {s.status === 'in_transit' && (
                      <button
                        onClick={() => handleOpenUpdate(s, 'out_for_delivery')}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                      >
                        Xuất kho giao cho khách
                      </button>
                    )}

                    {s.status === 'out_for_delivery' && (
                      <button
                        onClick={() => handleOpenUpdate(s, 'delivered')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                      >
                        Xác nhận giao thành công
                      </button>
                    )}

                    {s.status !== 'delivered' && s.status !== 'failed' && s.status !== 'returned' && (
                      <button
                        onClick={() => handleOpenUpdate(s, 'failed')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition"
                      >
                        Báo sự cố giao
                      </button>
                    )}

                    {s.status === 'failed' && (
                      <button
                        onClick={() => handleOpenUpdate(s, 'returned')}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                      >
                        Hoàn hàng về kho
                      </button>
                    )}

                    {(s.status === 'failed' || s.status === 'returned') && (
                      <button
                        onClick={() => handleOpenEscalate(s)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1"
                        title="Báo cáo sự cố và chuyển tiếp lên Admin phê duyệt hủy đơn"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Báo sự cố &amp; Chuyển tiếp Admin
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Update Status */}
      {isUpdateOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Cập nhật Trạng thái Kiện hàng: {selectedShipment.trackingNumber}
              </h3>
              <button onClick={() => setIsUpdateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trạng thái mới:</label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="picking_up">1. Đang lấy hàng tại kho Vendor (Picking up)</option>
                  <option value="in_transit">2. Đang luân chuyển qua Hub MIVA (In transit)</option>
                  <option value="out_for_delivery">3. Đang giao tới người nhận (Out for delivery)</option>
                  <option value="delivered">4. Đã giao thành công (Delivered - Tự động quyết toán COD nếu có)</option>
                  <option value="failed">5. Giao thất bại / Báo sự cố (Failed)</option>
                  <option value="returned">6. Đã hoàn hàng về Hub/Kho (Returned)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vị trí hiện tại:</label>
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="VD: Hub phân loại Tân Bình, Kho Vendor..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả chi tiết / Ghi chú:</label>
                <input
                  type="text"
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  placeholder="Ghi chú thêm nếu có..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {nextStatus === 'failed' && (
                <div>
                  <label className="block font-semibold text-rose-600 mb-1">Lý do giao hàng không thành công:</label>
                  <input
                    type="text"
                    value={failedReason}
                    onChange={(e) => setFailedReason(e.target.value)}
                    placeholder="VD: Người nhận không nghe máy 3 lần, hẹn lại..."
                    required
                    className="w-full px-3 py-2 rounded-xl border border-rose-300 text-xs focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUpdateOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition"
                >
                  {updating ? 'Đang lưu...' : 'Xác nhận cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Timeline & Details */}
      {isDetailOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Hành trình Vận đơn: {selectedShipment.trackingNumber}
              </h3>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Đơn hàng &amp; Vendor</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedShipment.order?.orderCode}</p>
                <p className="text-slate-500">{selectedShipment.vendorOrder?.vendor?.storeName || 'Miva Direct'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Người nhận &amp; Địa chỉ</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedShipment.receiverName} ({selectedShipment.receiverPhone})</p>
                <p className="text-slate-500 truncate" title={selectedShipment.shippingAddress}>{selectedShipment.shippingAddress}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Lịch sử các mốc sự kiện ({selectedShipment.events?.length || 0})
              </h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {selectedShipment.events?.map((ev, idx) => (
                  <div key={ev.id || idx} className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-800">{ev.description}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(ev.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ev.location || 'Hub MIVA'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Escalation to Admin */}
      {escalateShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">
                  Báo cáo Sự cố &amp; Chuyển tiếp Admin
                </h3>
              </div>
              <button onClick={() => setEscalateShipment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <p className="font-semibold">Kiện hàng: {escalateShipment.trackingNumber || escalateShipment.id}</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Đơn hàng gốc: #{escalateShipment.order?.orderCode || escalateShipment.orderId}
              </p>
              <p className="text-[11px] text-amber-600 mt-1">
                * Báo cáo này sẽ được chuyển trực tiếp vào hồ sơ đơn hàng để Admin phê duyệt hủy đơn, tự động hoàn kho và hoàn trả tiền cho khách hàng.
              </p>
            </div>

            <form onSubmit={handleEscalateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lý do sự cố:</label>
                <select
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Khách từ chối nhận / Bom hàng">1. Khách từ chối nhận / Bom hàng</option>
                  <option value="Không liên lạc được người nhận (gọi quá 3 lần)">2. Không liên lạc được người nhận (gọi quá 3 lần)</option>
                  <option value="Hàng hóa bị bể vỡ / hư hỏng trong luân chuyển">3. Hàng hóa bị bể vỡ / hư hỏng trong luân chuyển</option>
                  <option value="Địa chỉ nhận hàng không tồn tại">4. Địa chỉ nhận hàng không tồn tại</option>
                  <option value="Khách hẹn lại quá số lần quy định">5. Khách hẹn lại quá số lần quy định</option>
                  <option value="Khác (Sự cố vận hành)">6. Khác (Sự cố vận hành)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mức độ ưu tiên:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'medium', label: 'Trung bình', color: 'border-slate-200 text-slate-700' },
                    { id: 'high', label: 'Cao (High)', color: 'border-amber-300 text-amber-700' },
                    { id: 'critical', label: 'Khẩn cấp', color: 'border-rose-300 text-rose-700' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setEscalatePriority(p.id)}
                      className={`py-1.5 text-xs font-semibold rounded-xl border transition ${
                        escalatePriority === p.id 
                          ? 'bg-rose-50 border-rose-600 text-rose-700 ring-1 ring-rose-600 font-bold' 
                          : p.color
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chi tiết biên bản sự cố:</label>
                <textarea
                  rows={3}
                  value={escalateNote}
                  onChange={(e) => setEscalateNote(e.target.value)}
                  placeholder="Mô tả cụ thể diễn biến giao hàng thất bại để Admin đối soát..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEscalateShipment(null)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={escalating}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-xs transition"
                >
                  {escalating ? 'Đang gửi...' : 'Gửi báo cáo lên Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
