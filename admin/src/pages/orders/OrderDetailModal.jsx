import { useState } from 'react';
import { Modal, Button, Badge } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatHelpers';
import { ordersApi, employeesApi } from '../../api';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  Package, 
  Clock, 
  ShieldAlert,
  RotateCcw,
  CreditCard,
  User,
  MapPin,
  FileText,
  UserCheck,
  Sparkles,
  Shuffle,
  Loader2,
  X
} from 'lucide-react';

export default function OrderDetailModal({ isOpen, onClose, order, onStatusChange, onOrderUpdated }) {
  // Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assigning, setAssigning] = useState(false);
  if (!order) return null;

  // Retrieve items directly from real order details
  const orderItems = (order.details || []).map((od) => ({
    ...od,
    productName: od.productName || od.productVariant?.productColor?.product?.name || 'Sản phẩm',
    colorName: od.colorName || od.productVariant?.productColor?.color || '',
    size: od.sizeName || od.productVariant?.size || '',
    image: od.imageUrl || od.productVariant?.productColor?.imageUrls?.[0] || '',
  }));

  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'shipping': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getShipmentBadgeVariant = (status) => {
    switch(status) {
      case 'delivered': return 'success';
      case 'out_for_delivery':
      case 'in_transit': return 'info';
      case 'failed': return 'error';
      case 'returned': return 'warning';
      default: return 'default';
    }
  };

  const getShipmentStatusText = (status) => {
    switch(status) {
      case 'delivered': return 'Giao thành công';
      case 'out_for_delivery': return 'Đang đi giao';
      case 'in_transit': return 'Đang trung chuyển';
      case 'failed': return 'Giao thất bại';
      case 'returned': return 'Đã hoàn hàng về kho';
      case 'picking_up': return 'Đang lấy hàng';
      case 'assigned': return 'Đã phân công bưu tá';
      case 'pending': return 'Chờ phân phối';
      default: return status;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch(status) {
      case 'paid': return <Badge variant="success">Đã thanh toán</Badge>;
      case 'refunded': return <Badge variant="warning">Đã hoàn tiền</Badge>;
      case 'cancelled': return <Badge variant="error">Đã hủy thanh toán</Badge>;
      case 'pending': return <Badge variant="info">Chờ thanh toán</Badge>;
      case 'failed': return <Badge variant="error">Thanh toán lỗi</Badge>;
      default: return <Badge variant="default">{status || 'Chưa rõ'}</Badge>;
    }
  };

  // Find any incident escalation or failed shipment
  const escalationLog = (order.statusHistory || []).find(h => 
    h.note?.includes('[Chuyển tiếp Admin xử lý]') || 
    h.note?.includes('[Xử lý sự cố]') ||
    h.note?.includes('sự cố')
  );
  const hasFailedShipment = (order.shipments || []).some(s => s.status === 'failed' || s.status === 'returned');
  const showEscalationAlert = (order.status === 'shipping' || order.status === 'pending') && (escalationLog || hasFailedShipment);

  // Lấy danh sách phân công theo 3 phòng ban từ statusHistory & shipments
  const historyList = order.statusHistory || [];
  const reversedHistory = [...historyList].reverse();

  // 1. Chuyên viên Điều phối & Liên kết Vendor
  const handlingHistory = reversedHistory.find(h => 
    h.employee && (
      h.employee.department?.toLowerCase().includes('điều phối') ||
      h.employee.department?.toLowerCase().includes('vendor') ||
      h.note?.toLowerCase().includes('điều phối')
    )
  );
  const assignedHandling = handlingHistory?.employee;

  // 2. Bưu tá Phòng Vận chuyển & Giao nhận
  const directCarrier = order.shipments?.find(s => s.carrier)?.carrier;
  const shippingHistory = reversedHistory.find(h => 
    h.employee && (
      h.employee.department?.toLowerCase().includes('vận chuyển') ||
      h.employee.department?.toLowerCase().includes('giao nhận') ||
      h.note?.toLowerCase().includes('bưu tá') ||
      h.note?.toLowerCase().includes('giao nhận')
    )
  );
  const assignedShipper = directCarrier || shippingHistory?.employee;

  // 3. Chuyên viên Bộ phận Xử lý Sự cố & Ngoại lệ Đơn
  const exceptionHistory = reversedHistory.find(h => 
    h.employee && (
      h.employee.department?.toLowerCase().includes('sự cố') ||
      h.employee.department?.toLowerCase().includes('ngoại lệ') ||
      h.note?.toLowerCase().includes('sự cố') ||
      h.note?.toLowerCase().includes('khiếu nại') ||
      h.note?.toLowerCase().includes('tranh chấp')
    )
  );
  const assignedException = exceptionHistory?.employee;

  // Phân loại danh sách nhân viên thực tế từ DB theo phòng ban
  const handlingEmployees = employees.filter(e => {
    const dept = (e.department || '').toLowerCase();
    return dept.includes('điều phối') || dept.includes('vendor');
  });

  const shippingEmployees = employees.filter(e => {
    const dept = (e.department || '').toLowerCase();
    return dept.includes('vận chuyển') || dept.includes('giao nhận');
  });

  const exceptionEmployees = employees.filter(e => {
    const dept = (e.department || '').toLowerCase();
    return dept.includes('sự cố') || dept.includes('ngoại lệ');
  });

  const otherEmployees = employees.filter(e => {
    const dept = (e.department || '').toLowerCase();
    return !dept.includes('điều phối') && !dept.includes('vendor') &&
           !dept.includes('vận chuyển') && !dept.includes('giao nhận') &&
           !dept.includes('sự cố') && !dept.includes('ngoại lệ');
  });

  // Open Assign Modal and fetch real employees
  const handleOpenAssignModal = async (defaultEmpId) => {
    setIsAssignModalOpen(true);
    setAssignNote('');
    setSelectedEmpId(defaultEmpId || assignedShipper?.id || assignedHandling?.id || assignedException?.id || '');
    if (employees.length === 0) {
      try {
        setLoadingEmployees(true);
        const res = await employeesApi.getEmployees({ itemPerPage: 100 });
        const list = res.list || res.data?.list || (Array.isArray(res) ? res : []);
        setEmployees(list.filter(e => e.status === 'active'));
      } catch (err) {
        console.error('Failed to load employees:', err);
      } finally {
        setLoadingEmployees(false);
      }
    }
  };

  // Submit manual assignment
  const handleManualAssign = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) {
      alert('Vui lòng chọn nhân viên phụ trách');
      return;
    }
    try {
      setAssigning(true);
      const res = await ordersApi.assignOrder(order.id, {
        employeeId: selectedEmpId,
        note: assignNote || undefined,
      });
      alert('Phân công nhân viên phụ trách đơn hàng thành công!');
      setIsAssignModalOpen(false);
      if (onOrderUpdated) onOrderUpdated(res.data || res);
    } catch (err) {
      alert(`Lỗi phân công: ${err.response?.data?.message || err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  // Trigger auto-assignment by system (random but according to department)
  const handleAutoAssign = async (departmentType) => {
    const deptLabels = {
      handling: 'Bộ phận Điều phối & Liên kết Vendor',
      shipping: 'Phòng Vận chuyển & Giao nhận',
      exception: 'Bộ phận Xử lý Sự cố & Ngoại lệ Đơn',
    };
    const confirmMsg = departmentType
      ? `Hệ thống sẽ chọn ngẫu nhiên một nhân viên thuộc [${deptLabels[departmentType]}] để phân công. Bạn có muốn tiếp tục?`
      : 'Hệ thống sẽ tự động phân tích trạng thái đơn và chọn ngẫu nhiên nhân sự đúng phòng ban tương ứng. Bạn có muốn tiếp tục?';
    if (!confirm(confirmMsg)) return;

    try {
      setAssigning(true);
      const res = await ordersApi.autoAssignOrder(order.id, departmentType ? { department: departmentType } : {});
      alert('Hệ thống đã tự động phân công ngẫu nhiên nhân viên thành công!');
      setIsAssignModalOpen(false);
      if (onOrderUpdated) onOrderUpdated(res.data || res);
    } catch (err) {
      alert(`Lỗi tự động phân công: ${err.response?.data?.message || err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Chi tiết đơn hàng #${order.orderCode || order.id}`}
        maxWidth="max-w-4xl"
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>Đóng</Button>
            {onStatusChange && (
              <div className="flex flex-wrap gap-2 ml-auto">
                {order.status === 'pending' && (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white" 
                    onClick={() => onStatusChange(order.id, 'confirmed')}
                  >
                    Duyệt đơn (Confirmed)
                  </Button>
                )}
                {order.status === 'shipping' && (
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                    onClick={() => onStatusChange(order.id, 'completed', 'Admin xác nhận hoàn thành đơn hàng')}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5 inline" />
                    Xác nhận giao thành công (Completed)
                  </Button>
                )}
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <Button 
                    variant="danger" 
                    onClick={() => {
                      const defaultReason = escalationLog?.note 
                        ? `Phê duyệt sự cố từ Shipper: ${escalationLog.note}`
                        : hasFailedShipment 
                          ? 'Giao hàng thất bại / Khách từ chối nhận' 
                          : 'Admin hủy đơn và hoàn kho';
                      const reason = prompt('Nhập lý do hủy đơn hàng (sẽ tự động hoàn kho, hoàn voucher, xử lý hoàn tiền):', defaultReason);
                      if (reason !== null && reason.trim()) {
                        onStatusChange(order.id, 'cancelled', reason.trim());
                      }
                    }}
                  >
                    <ShieldAlert className="w-4 h-4 mr-1.5 inline" />
                    Duyệt hủy đơn & Hoàn kho (Cancel)
                  </Button>
                )}
              </div>
            )}
          </>
        }
      >
        <div className="space-y-6">

          {/* Escalation Alert if employee reported incident */}
          {showEscalationAlert && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl p-4 text-amber-900 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm">
                    Cảnh báo sự cố vận chuyển cần Admin xem xét phê duyệt:
                  </p>
                  {escalationLog ? (
                    <p className="text-xs bg-white/70 dark:bg-black/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900 font-mono">
                      {escalationLog.note}
                    </p>
                  ) : (
                    <p className="text-xs">
                      Kiện hàng đã chuyển sang trạng thái <strong>Giao thất bại / Đã hoàn hàng</strong>. Bạn có thể nhấn <strong>"Duyệt hủy đơn & Hoàn kho"</strong> bên dưới để hoàn tất quy trình xử lý dừng đơn.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Top Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Thông tin đơn hàng
              </h4>
              <div className="space-y-1.5 text-sm">
                <p><span className="text-slate-500 dark:text-slate-400">Mã đơn:</span> <span className="font-mono font-medium text-slate-800 dark:text-slate-100">{order.orderCode || order.id}</span></p>
                <p><span className="text-slate-500 dark:text-slate-400">Ngày tạo:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{formatDate(order.createdAt)}</span></p>
                <p className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400">Trạng thái:</span> 
                  <Badge variant={getStatusBadgeVariant(order.status)}>{order.status.toUpperCase()}</Badge>
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-xs">Thanh toán:</span>
                    <span className="font-medium uppercase text-xs text-slate-700 dark:text-slate-300">
                      {order.payment?.method || order.paymentMethod || 'COD'}
                    </span>
                  </div>
                  <div>
                    {getPaymentStatusBadge(order.payment?.status)}
                    {order.payment?.paidAt && (
                      <span className="block text-[11px] text-slate-400 text-right mt-0.5">
                        {formatDate(order.payment.paidAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Thông tin người nhận
              </h4>
              <div className="space-y-1.5 text-sm">
                <p><span className="text-slate-500 dark:text-slate-400">Họ tên:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{order.userName || order.client?.fullName || order.receiverName || 'Khách hàng'}</span></p>
                {order.client?.email && <p><span className="text-slate-500 dark:text-slate-400">Email:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{order.client.email}</span></p>}
                {(order.receiverPhone || order.client?.phone) && <p><span className="text-slate-500 dark:text-slate-400">Số ĐT:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{order.receiverPhone || order.client?.phone}</span></p>}
                <p className="flex items-start gap-1">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-800 dark:text-slate-100">{order.shippingAddress || 'Chưa cung cấp địa chỉ'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Phân công nhân sự theo 3 phòng ban nghiệp vụ */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Nhân sự phân công phụ trách đơn hàng (3 Ban nghiệp vụ)
              </h4>
              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={handleOpenAssignModal}
                  disabled={assigning}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Chỉnh lại nhân viên phụ trách
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* Ban 1: Điều phối & Liên kết Vendor */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs">
                <div className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-indigo-500" />
                    1. Điều phối & Vendor
                  </span>
                  {assignedHandling && <Badge variant="success" size="sm">Đã phân công</Badge>}
                </div>
                {assignedHandling ? (
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {assignedHandling.fullName?.charAt(0) || 'Đ'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                        {assignedHandling.fullName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {assignedHandling.employeeCode} {assignedHandling.phone ? `• ${assignedHandling.phone}` : ''}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2.5 text-xs text-slate-400 italic">Chưa chỉ định điều phối</p>
                )}
              </div>

              {/* Ban 2: Vận chuyển & Giao nhận */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-blue-500" />
                      2. Bưu tá Giao nhận
                    </span>
                    {assignedShipper && <Badge variant="success" size="sm">Đã phân công</Badge>}
                  </div>
                  {assignedShipper ? (
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {assignedShipper.fullName?.charAt(0) || 'S'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                          {assignedShipper.fullName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {assignedShipper.employeeCode} {assignedShipper.phone ? `• ${assignedShipper.phone}` : ''}
                        </p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                          {assignedShipper.department || 'Phòng Vận chuyển & Giao nhận'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2.5">
                      <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                        Chưa phân công bưu tá
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAssignModal(assignedShipper?.id)}
                    disabled={assigning}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    title="Admin chỉnh lại bưu tá giao nhận phụ trách đơn này"
                  >
                    <UserCheck className="w-3 h-3" />
                    Chỉnh lại bưu tá
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={() => handleAutoAssign('shipping')}
                    disabled={assigning}
                    className="text-[11px] font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 inline-flex items-center gap-1"
                    title="Hệ thống tự động phân công bưu tá từ Phòng Vận chuyển & Giao nhận"
                  >
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    Tự động phân công
                  </button>
                </div>
              </div>

              {/* Ban 3: Xử lý Sự cố & Ngoại lệ */}
              <div className={`p-3 rounded-xl border shadow-xs ${
                assignedException 
                  ? 'border-amber-300 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20' 
                  : (showEscalationAlert || order.status === 'cancelled')
                    ? 'border-red-300 dark:border-red-800/60 bg-red-50/40 dark:bg-red-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80'
              }`}>
                <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    3. Xử lý Sự cố & Ngoại lệ
                  </span>
                  {assignedException && <Badge variant="warning" size="sm">Đang giải quyết</Badge>}
                </div>
                {assignedException ? (
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {assignedException.fullName?.charAt(0) || 'E'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                        {assignedException.fullName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {assignedException.employeeCode} {assignedException.phone ? `• ${assignedException.phone}` : ''}
                      </p>
                    </div>
                  </div>
                ) : (showEscalationAlert || order.status === 'cancelled') ? (
                  <p className="mt-2.5 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Có sự cố (chờ chỉ định)
                  </p>
                ) : (
                  <p className="mt-2.5 text-xs text-slate-400 italic">Không có sự cố</p>
                )}
              </div>
            </div>
          </div>

          {/* Shipments / Internal Shipping info */}
          {(order.shipments || []).length > 0 && (
            <div>
              <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                Kiện hàng & Vận chuyển nội bộ ({order.shipments.length})
              </h4>
              <div className="space-y-3">
                {order.shipments.map((shipment) => (
                  <div key={shipment.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {shipment.trackingNumber || `SP-${shipment.id.slice(0, 8)}`}
                        </span>
                        <Badge variant={getShipmentBadgeVariant(shipment.status)}>
                          {getShipmentStatusText(shipment.status)}
                        </Badge>
                      </div>
                      {shipment.carrier && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Bưu tá phụ trách: <span className="font-medium text-slate-700 dark:text-slate-200">{shipment.carrier.fullName}</span> ({shipment.carrier.employeeCode || shipment.carrier.phone || 'Nội bộ'})
                        </p>
                      )}
                      {shipment.failedReason && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          Lý do giao thất bại: {shipment.failedReason}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 md:text-right">
                      Cập nhật: {formatDate(shipment.updatedAt || shipment.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Items Table */}
          <div>
            <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-600" />
              Sản phẩm trong đơn
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="px-4 py-3 font-medium">Sản phẩm</th>
                    <th className="px-4 py-3 font-medium">Đơn giá</th>
                    <th className="px-4 py-3 font-medium">Số lượng</th>
                    <th className="px-4 py-3 font-medium text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 transition-colors">
                  {orderItems.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.productName} className="w-10 h-10 rounded object-cover border border-slate-200 dark:border-slate-800" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 dark:border-slate-800"></div>
                          )}
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">{item.productName || 'Sản phẩm'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.colorName} • Size {item.size}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">x{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800 dark:text-slate-100">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Tạm tính</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(order.subtotalAmount || order.totalAmount)}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Giảm giá Voucher</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Phí vận chuyển</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {Number(order.shippingFee) > 0 ? formatCurrency(order.shippingFee) : 'Miễn phí'}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-semibold text-slate-800 dark:text-slate-100">Tổng cộng</span>
                <span className="font-bold text-blue-600 text-lg">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Order Status History / Audit Trail */}
          {(order.statusHistory || []).length > 0 && (
            <div>
              <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                Lịch sử đơn hàng & Ghi vết xử lý ({order.statusHistory.length})
              </h4>
              <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/30 max-h-56 overflow-y-auto">
                {order.statusHistory.map((hist, index) => {
                  const actorLabel = hist.admin 
                    ? `Admin (${hist.admin.fullName})` 
                    : hist.employee 
                      ? `Nhân viên: ${hist.employee.fullName} (${hist.employee.employeeCode || ''})`
                      : hist.vendor
                        ? `Vendor: ${hist.vendor.storeName || hist.vendor.fullName}`
                        : hist.client
                          ? `Khách hàng: ${hist.client.fullName}`
                          : 'Hệ thống tự động';

                  return (
                    <div key={hist.id || index} className="text-xs p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {actorLabel}
                        </span>
                        <span>{formatDate(hist.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-600 dark:text-slate-400 uppercase">
                          {hist.fromStatus || 'MỚI'} &rarr; {hist.toStatus}
                        </span>
                      </div>
                      {hist.note && (
                        <p className="mt-1 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded">
                          {hist.note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </Modal>

      {/* Modal: Phân công / Chỉnh lại nhân viên xử lý */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Phân công / Chỉnh lại Nhân viên Phụ trách
              </h3>
              <button 
                onClick={() => setIsAssignModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-300">
              <p className="font-semibold">Mã đơn: #{order.orderCode || order.id.slice(0, 8)}</p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400">
                Người nhận: {order.receiverName || order.client?.fullName} • {order.receiverPhone || ''}
              </p>
            </div>

            {/* Quick Random Assign according to Department */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Phân công ngẫu nhiên theo đúng phòng ban:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleAutoAssign('handling')}
                  disabled={assigning}
                  className="px-2.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-indigo-200 dark:border-indigo-800 transition"
                  title="Chọn ngẫu nhiên 1 nhân viên thuộc Ban Điều phối & Vendor"
                >
                  <Shuffle className="w-3.5 h-3.5 shrink-0" />
                  Random Ban Điều phối
                </button>
                <button
                  type="button"
                  onClick={() => handleAutoAssign('shipping')}
                  disabled={assigning}
                  className="px-2.5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800 transition"
                  title="Chọn ngẫu nhiên 1 bưu tá thuộc Ban Vận chuyển & Giao nhận"
                >
                  <Shuffle className="w-3.5 h-3.5 shrink-0" />
                  Random Ban Vận chuyển
                </button>
                <button
                  type="button"
                  onClick={() => handleAutoAssign('exception')}
                  disabled={assigning}
                  className="px-2.5 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-amber-200 dark:border-amber-800 transition"
                  title="Chọn ngẫu nhiên 1 chuyên viên thuộc Ban Xử lý Sự cố"
                >
                  <Shuffle className="w-3.5 h-3.5 shrink-0" />
                  Random Ban Sự cố
                </button>
                <button
                  type="button"
                  onClick={() => handleAutoAssign()}
                  disabled={assigning}
                  className="px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition"
                  title="Hệ thống tự động chọn ngẫu nhiên đúng phòng ban theo trạng thái đơn"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  Tự động theo trạng thái
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="shrink mx-2 text-[11px] text-slate-400 font-medium">hoặc Admin tự chọn nhân viên</span>
              <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <form onSubmit={handleManualAssign} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chọn nhân viên theo đúng phòng ban:
                </label>
                {loadingEmployees ? (
                  <div className="py-4 text-center text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    Đang tải danh sách nhân viên thực tế...
                  </div>
                ) : (
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 text-xs"
                  >
                    <option value="">-- Chọn nhân viên phụ trách --</option>
                    
                    {handlingEmployees.length > 0 && (
                      <optgroup label={`📋 BỘ PHẬN ĐIỀU PHỐI & LIÊN KẾT VENDOR (${handlingEmployees.length})`}>
                        {handlingEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.fullName} ({emp.employeeCode}) {emp.phone ? `• [${emp.phone}]` : ''}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {shippingEmployees.length > 0 && (
                      <optgroup label={`🚚 PHÒNG VẬN CHUYỂN & GIAO NHẬN (${shippingEmployees.length})`}>
                        {shippingEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.fullName} ({emp.employeeCode}) {emp.phone ? `• [${emp.phone}]` : ''}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {exceptionEmployees.length > 0 && (
                      <optgroup label={`🛡️ BỘ PHẬN XỬ LÝ SỰ CỐ & NGOẠI LỆ ĐƠN (${exceptionEmployees.length})`}>
                        {exceptionEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.fullName} ({emp.employeeCode}) {emp.phone ? `• [${emp.phone}]` : ''}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {otherEmployees.length > 0 && (
                      <optgroup label={`🏢 CÁC NHÂN VIÊN KHÁC (${otherEmployees.length})`}>
                        {otherEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.fullName} ({emp.employeeCode}) - {emp.department}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi chú điều phối của Admin (Lưu vào lịch sử đơn):
                </label>
                <textarea
                  rows={2}
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  placeholder="VD: Admin chỉ định nhân viên xử lý tiếp nhận / đổi bưu tá theo khu vực..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold transition"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={assigning || !selectedEmpId}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition"
                >
                  {assigning ? 'Đang lưu...' : 'Xác nhận phân công'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
