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
  Loader2,
  X
} from 'lucide-react';

export default function OrderDetailModal({ isOpen, onClose, order, onStatusChange, onOrderUpdated }) {
  if (!order) return null;

  // Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assigning, setAssigning] = useState(false);

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

  // Find assigned employee if any
  const assignedCarrier = order.shipments?.find(s => s.carrier)?.carrier;

  // Open Assign Modal and fetch real employees
  const handleOpenAssignModal = async () => {
    setIsAssignModalOpen(true);
    setAssignNote('');
    setSelectedEmpId(assignedCarrier?.id || '');
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

  // Trigger auto-assignment by system
  const handleAutoAssign = async () => {
    if (!confirm('Hệ thống sẽ tự động phân tích và chọn nhân viên có tải công việc thấp nhất để phân công. Bạn có muốn tiếp tục?')) return;
    try {
      setAssigning(true);
      const res = await ordersApi.autoAssignOrder(order.id);
      alert('Hệ thống đã tự động phân công nhân viên thành công!');
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

          {/* Assigned Employee (Phân công nhân sự phụ trách) */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  Nhân viên phụ trách đơn hàng
                </h4>
                {assignedCarrier ? (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                      {assignedCarrier.fullName?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                          {assignedCarrier.fullName}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {assignedCarrier.employeeCode}
                        </span>
                        <Badge variant="success">Đã phân công</Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {assignedCarrier.department || 'Bộ phận Vận hành'} {assignedCarrier.phone ? `• SĐT: ${assignedCarrier.phone}` : ''}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Đơn hàng chưa có nhân viên phụ trách xử lý. Hệ thống có thể tự động phân công hoặc Admin chủ động chỉ định.</span>
                  </div>
                )}
              </div>

              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenAssignModal}
                    disabled={assigning}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    {assignedCarrier ? 'Thay đổi phân công' : 'Chỉ định nhân viên'}
                  </button>
                </div>
              )}
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

      {/* Modal: Phân công nhân viên xử lý */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Phân công Nhân viên Phụ trách Đơn hàng
              </h3>
              <button 
                onClick={() => setIsAssignModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
              <div>
                <p className="font-semibold">Mã đơn: #{order.orderCode || order.id.slice(0, 8)}</p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400">
                  Người nhận: {order.receiverName || order.client?.fullName} • {order.receiverPhone || ''}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutoAssign}
                disabled={assigning}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1 shrink-0 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Tự động chọn NV tối ưu
              </button>
            </div>

            <form onSubmit={handleManualAssign} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chọn nhân viên cụ thể ({employees.length} nhân viên hoạt động):
                </label>
                {loadingEmployees ? (
                  <div className="py-4 text-center text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    Đang tải danh sách nhân viên...
                  </div>
                ) : (
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn nhân viên phụ trách --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.employeeCode}) - {emp.department} {emp.phone ? `[${emp.phone}]` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi chú điều phối (Lưu vào lịch sử đơn hàng):
                </label>
                <textarea
                  rows={2}
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  placeholder="VD: Phân công nhân viên bưu tá phụ trách giao tuyến Tân Bình..."
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
