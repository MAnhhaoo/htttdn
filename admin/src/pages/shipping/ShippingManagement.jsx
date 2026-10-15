import { useState, useEffect, useCallback } from 'react';
import { 
  Truck, Search, Filter, RefreshCw, UserCheck, CheckCircle2, 
  Clock, AlertTriangle, ChevronLeft, ChevronRight, MapPin, 
  Calendar, FileText, ArrowRight, User, Phone, Package, Send
} from 'lucide-react';
import { shippingApi, employeesApi } from '../../api';
import { Button, Input, Modal, Badge } from '../../components/ui';

const STATUS_CONFIG = {
  pending: { label: 'Chờ tiếp nhận', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  assigned: { label: 'Đã phân công', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  picking_up: { label: 'Đang lấy hàng', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  in_transit: { label: 'Đang luân chuyển', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  out_for_delivery: { label: 'Đang giao hàng', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  delivered: { label: 'Giao thành công', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  failed: { label: 'Giao thất bại', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  returned: { label: 'Đã hoàn hàng', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

export default function ShippingManagement() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  // Assignment form
  const [employees, setEmployees] = useState([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState('');
  const [carrierType, setCarrierType] = useState('employee');
  const [assignNotes, setAssignNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Status update form
  const [updateStatusVal, setUpdateStatusVal] = useState('in_transit');
  const [updateLocation, setUpdateLocation] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [failedReason, setFailedReason] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch employees for assignment dropdown
  useEffect(() => {
    employeesApi.getEmployees({ itemPerPage: 100, status: 'active' })
      .then(res => {
        setEmployees(res.data?.list || []);
      })
      .catch(err => console.error('Error fetching employees:', err));
  }, []);

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        itemPerPage: 10,
        ...(search ? { q: search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      };

      const res = await shippingApi.getShipments(params);
      const data = res.data || res;
      setShipments(data.list || []);
      setTotalItems(data.totalItems || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching shipments:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // Open Assign Modal
  const handleOpenAssign = (shipment) => {
    setSelectedShipment(shipment);
    setSelectedCarrierId(shipment.carrierId || (employees[0]?.id || ''));
    setCarrierType(shipment.carrierType || 'employee');
    setAssignNotes('');
    setIsAssignOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCarrierId) {
      alert('Vui lòng chọn nhân viên điều phối');
      return;
    }
    try {
      setAssigning(true);
      await shippingApi.assignCarrier(selectedShipment.id, {
        carrierId: selectedCarrierId,
        carrierType,
        notes: assignNotes,
      });
      setIsAssignOpen(false);
      fetchShipments();
    } catch (err) {
      alert(`Lỗi phân công: ${err.response?.data?.message || err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  // Open Update Status Modal
  const handleOpenUpdate = (shipment) => {
    setSelectedShipment(shipment);
    setUpdateStatusVal(shipment.status === 'pending' ? 'assigned' : shipment.status === 'assigned' ? 'picking_up' : 'in_transit');
    setUpdateLocation('Trung tâm Logistics MIVA');
    setUpdateDescription('');
    setFailedReason('');
    setIsUpdateOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await shippingApi.updateStatus(selectedShipment.id, {
        status: updateStatusVal,
        location: updateLocation,
        description: updateDescription,
        failedReason: updateStatusVal === 'failed' ? failedReason : undefined,
      });
      setIsUpdateOpen(false);
      fetchShipments();
    } catch (err) {
      alert(`Lỗi cập nhật trạng thái: ${err.response?.data?.message || err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Open Timeline Modal
  const handleOpenTimeline = async (shipment) => {
    try {
      const res = await shippingApi.getShipment(shipment.id);
      setSelectedShipment(res.data || res);
      setIsTimelineOpen(true);
    } catch (err) {
      alert(`Lỗi tải chi tiết: ${err.message}`);
    }
  };

  // Quick Stats
  const pendingCount = shipments.filter(s => s.status === 'pending').length;
  const inTransitCount = shipments.filter(s => s.status === 'in_transit' || s.status === 'out_for_delivery').length;
  const deliveredCount = shipments.filter(s => s.status === 'delivered').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-blue-600" />
            Điều phối Vận chuyển Nội bộ (MIVA Logistics)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý vận đơn, điều phối nhân sự giao hàng và theo dõi hành trình kiện hàng thời gian thực.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchShipments} 
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng vận đơn</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalItems}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Chờ điều phối</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Đang luân chuyển & Giao</p>
            <p className="text-2xl font-bold text-cyan-600 mt-1">{inTransitCount}</p>
          </div>
          <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl text-cyan-600">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Giao thành công</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{deliveredCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã vận đơn, mã đơn, người nhận, SĐT..."
              className="pl-9 w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="sm:w-56">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ tiếp nhận</option>
              <option value="assigned">Đã phân công</option>
              <option value="picking_up">Đang lấy hàng</option>
              <option value="in_transit">Đang luân chuyển</option>
              <option value="out_for_delivery">Đang giao hàng</option>
              <option value="delivered">Giao thành công</option>
              <option value="failed">Giao thất bại</option>
              <option value="returned">Đã hoàn hàng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Mã Vận đơn & Đơn hàng</th>
                <th className="px-5 py-3.5 font-semibold">Gian hàng (Vendor)</th>
                <th className="px-5 py-3.5 font-semibold">Người nhận & Địa chỉ</th>
                <th className="px-5 py-3.5 font-semibold">Nhân sự vận chuyển</th>
                <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                <th className="px-5 py-3.5 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Đang tải dữ liệu vận đơn...
                  </td>
                </tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    <Truck className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    Không tìm thấy vận đơn nào phù hợp.
                  </td>
                </tr>
              ) : (
                shipments.map((s) => {
                  const statusConf = STATUS_CONFIG[s.status] || { label: s.status, color: 'bg-slate-100 text-slate-600' };
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-blue-600 dark:text-blue-400 font-mono text-xs">
                          {s.trackingNumber}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Đơn: <span className="font-medium text-slate-700 dark:text-slate-300">{s.order?.orderCode}</span>
                        </div>
                        {s.vendorOrder && (
                          <div className="text-[11px] text-slate-400">
                            Kiện: {s.vendorOrder.vendorOrderCode}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {s.vendorOrder?.vendor?.storeName || 'Kho Tổng Miva'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {s.vendorOrder?.vendor?.fullName || 'Hệ thống MIVA'}
                        </div>
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{s.receiverName || 'Khách hàng'}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{s.receiverPhone || 'N/A'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5" title={s.shippingAddress}>
                          {s.shippingAddress}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {s.carrier ? (
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>{s.carrier.fullName}</span>
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              {s.carrier.employeeCode} {s.carrier.phone ? `• ${s.carrier.phone}` : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Chưa phân công
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                        {s.events?.[0] && (
                          <div className="text-[11px] text-slate-400 mt-1 truncate max-w-[180px]" title={s.events[0].description}>
                            {s.events[0].description}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAssign(s)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                            title="Phân công nhân sự vận chuyển"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenUpdate(s)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition"
                            title="Cập nhật trạng thái & vị trí"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenTimeline(s)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Xem hành trình chi tiết"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Hiển thị trang <span className="font-semibold text-slate-700 dark:text-slate-300">{page}</span> / {totalPages} (Tổng {totalItems} vận đơn)
          </div>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal 1: Assign Carrier Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title={`Điều phối Vận đơn: ${selectedShipment?.trackingNumber}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Chọn Nhân sự Giao nhận / Điều phối:
            </label>
            <select
              value={selectedCarrierId}
              onChange={(e) => setSelectedCarrierId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Chọn nhân sự vận chuyển --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeCode}) - {emp.department || 'Vận chuyển'} - {emp.phone || 'SĐT N/A'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Loại phương thức vận chuyển:
            </label>
            <select
              value={carrierType}
              onChange={(e) => setCarrierType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="employee">Đội ngũ Giao hàng Nội bộ MIVA</option>
              <option value="hub_express">Tuyến Hỏa tốc Nội bộ Hub</option>
              <option value="third_party">Đối tác liên kết (GHN/GHTK/ViettelPost)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Ghi chú điều phối:
            </label>
            <textarea
              value={assignNotes}
              onChange={(e) => setAssignNotes(e.target.value)}
              placeholder="VD: Kiện hàng dễ vỡ, giao trước 17h, liên hệ bảo vệ trước khi tới..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsAssignOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={assigning} className="bg-blue-600 hover:bg-blue-700 text-white">
              {assigning ? 'Đang phân công...' : 'Xác nhận Điều phối'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Update Status Modal */}
      <Modal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        title={`Cập nhật Hành trình: ${selectedShipment?.trackingNumber}`}
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Trạng thái tiếp theo:
            </label>
            <select
              value={updateStatusVal}
              onChange={(e) => setUpdateStatusVal(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="picking_up">1. Đang lấy hàng tại kho Vendor (Picking up)</option>
              <option value="in_transit">2. Đang luân chuyển qua Hub phân loại (In Transit)</option>
              <option value="out_for_delivery">3. Đang trên đường giao người nhận (Out for Delivery)</option>
              <option value="delivered">4. Đã giao thành công (Delivered - Tự động thu tiền COD nếu có)</option>
              <option value="failed">5. Giao thất bại (Failed)</option>
              <option value="returned">6. Hoàn hàng về kho (Returned)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Địa điểm cập nhật:
            </label>
            <Input
              value={updateLocation}
              onChange={(e) => setUpdateLocation(e.target.value)}
              placeholder="VD: Hub phân loại Tân Bình, Kho Vendor Ba Đình..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Mô tả chi tiết / Ghi chú sự kiện:
            </label>
            <Input
              value={updateDescription}
              onChange={(e) => setUpdateDescription(e.target.value)}
              placeholder="Để trống sẽ tự động áp dụng thông điệp chuẩn của hệ thống"
            />
          </div>

          {updateStatusVal === 'failed' && (
            <div>
              <label className="block text-xs font-semibold text-rose-600 mb-1.5">
                Lý do giao hàng thất bại:
              </label>
              <Input
                value={failedReason}
                onChange={(e) => setFailedReason(e.target.value)}
                placeholder="VD: Không gọi được khách hàng 3 lần, khách hẹn ngày khác..."
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsUpdateOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={updating} className="bg-amber-600 hover:bg-amber-700 text-white">
              {updating ? 'Đang lưu...' : 'Cập nhật Hành trình'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Timeline & Details Modal */}
      <Modal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        title={`Chi tiết Hành trình Vận đơn ${selectedShipment?.trackingNumber}`}
        maxWidth="max-w-3xl"
      >
        {selectedShipment && (
          <div className="space-y-6">
            {/* Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">Thông tin đơn hàng</p>
                <p className="font-semibold text-slate-800 dark:text-white mt-1">Mã đơn: {selectedShipment.order?.orderCode}</p>
                <p className="text-slate-500 mt-0.5">Kiện hàng Vendor: {selectedShipment.vendorOrder?.vendorOrderCode || 'Chưa tách kiện'}</p>
                <p className="text-slate-500 mt-0.5">Kho Vendor: {selectedShipment.vendorOrder?.vendor?.storeName || 'Miva Central'}</p>
              </div>
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">Người nhận & Địa chỉ</p>
                <p className="font-semibold text-slate-800 dark:text-white mt-1">{selectedShipment.receiverName || 'Khách hàng'}</p>
                <p className="text-slate-500 mt-0.5">SĐT: {selectedShipment.receiverPhone || 'N/A'}</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">{selectedShipment.shippingAddress}</p>
              </div>
            </div>

            {/* Carrier Info */}
            <div className="flex items-center justify-between p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-white">
                    Nhân viên vận chuyển: {selectedShipment.carrier?.fullName || 'Chưa chỉ định'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Mã NV: {selectedShipment.carrier?.employeeCode || 'N/A'} • ĐT: {selectedShipment.carrier?.phone || 'N/A'}
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[selectedShipment.status]?.color}`}>
                {STATUS_CONFIG[selectedShipment.status]?.label || selectedShipment.status}
              </span>
            </div>

            {/* Events Timeline */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Nhật ký hành trình kiện hàng ({selectedShipment.events?.length || 0} mốc)
              </h3>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {selectedShipment.events && selectedShipment.events.length > 0 ? (
                  selectedShipment.events.map((ev, idx) => (
                    <div key={ev.id || idx} className="relative group">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                      <div className="bg-white dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                            {ev.description}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(ev.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ev.location || 'Hub Vận Chuyển MIVA'}</span>
                          {ev.actorRole && (
                            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-medium text-[10px]">
                              {ev.actorRole}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Chưa có nhật ký hành trình được ghi nhận.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={() => setIsTimelineOpen(false)}>Đóng</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
