import { useState, useEffect } from 'react';
import { Button, Badge } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatHelpers';
import {
  computeBatchOrderFinancials,
  extractOrderEmployees,
  extractOrderVendors,
  formatShortOrderCode,
  formatVendorCode,
  categorizeEmployeesByDepartment,
  getOrderStatusBadgeVariant,
  getShipmentBadgeVariant,
  getShipmentStatusText,
} from '../../utils/orderHelpers';
import { ordersApi, employeesApi } from '../../api';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  Package, 
  Clock, 
  ShieldAlert,
  User,
  MapPin,
  FileText,
  UserCheck,
  Sparkles,
  Shuffle,
  Loader2,
  TicketPercent,
  Layers,
  Store,
  X
} from 'lucide-react';

export default function OrderDetailModal({ isOpen, onClose, order: rawOrder, onStatusChange, onOrderUpdated }) {
  // Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Khi hóa đơn gộp từ nhiều đơn hàng con (subOrders), cho phép chọn xem từng đơn hoặc xem tất cả
  const [selectedSubIndex, setSelectedSubIndex] = useState(0);

  useEffect(() => {
    setSelectedSubIndex(0);
  }, [rawOrder?.id, isOpen]);

  if (!rawOrder) return null;

  const subOrders = rawOrder.subOrders && rawOrder.subOrders.length > 0 ? rawOrder.subOrders : [rawOrder];
  const isMergedGroup = subOrders.length > 1;
  const order = subOrders[selectedSubIndex] || subOrders[0];

  const orderVendors = extractOrderVendors(order);
  const fullOrderCode = order.orderCode || order.id;
  const shortOrderCode = formatShortOrderCode(fullOrderCode);

  // Retrieve items directly from real order details of currently selected subOrder
  const orderItems = (order.details || []).map((od) => {
    const prodVendor = od.productVariant?.productColor?.product?.vendor;
    const prodVendorId = prodVendor?.id || od.productVariant?.productColor?.product?.vendorId;
    const matchedVendor =
      orderVendors.find((v) => v.id === prodVendorId) || orderVendors[0] || null;
    return {
      ...od,
      productName: od.productName || od.productVariant?.productColor?.product?.name || 'Sản phẩm',
      colorName: od.colorName || od.productVariant?.productColor?.color || '',
      size: od.sizeName || od.productVariant?.size || '',
      image: od.imageUrl || od.productVariant?.productColor?.imageUrls?.[0] || '',
      vendorName:
        prodVendor?.storeName || prodVendor?.fullName || matchedVendor?.name || 'Hệ thống MIVA',
      vendorCode: prodVendorId
        ? formatVendorCode(prodVendorId, prodVendor?.vendorCode)
        : matchedVendor?.vendorCode || null,
    };
  });

  const totalQuantity = orderItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const appliedVouchers = order.voucherDetails || [];

  // Tổng hợp tài chính toàn bộ cụm đơn (tách rõ đơn hiệu lực và đơn đã hủy)
  const batchFin = computeBatchOrderFinancials(subOrders);

  const getStatusBadgeVariant = getOrderStatusBadgeVariant;

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

  // Tái sử dụng hàm trích xuất nhân sự theo 3 phòng ban từ orderHelpers.js
  const {
    handlingEmp: assignedHandling,
    shippingEmp: assignedShipper,
    exceptionEmp: assignedException,
  } = extractOrderEmployees(order);

  const shipments = order.shipments || [];
  const isEditable = order.status !== 'completed' && order.status !== 'cancelled';

  // Tái sử dụng hàm phân loại nhân viên theo 3 phòng ban từ orderHelpers.js
  const {
    handlingEmployees,
    shippingEmployees,
    exceptionEmployees,
    otherEmployees,
  } = categorizeEmployeesByDepartment(employees);

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
      const chosenEmp = employees.find((emp) => emp.id === selectedEmpId);
      const isHandlingEmp =
        (chosenEmp?.department || '').toLowerCase().includes('điều phối') ||
        (chosenEmp?.department || '').toLowerCase().includes('vendor');
      const res = await ordersApi.assignOrder(order.id, {
        employeeId: selectedEmpId,
        note: assignNote || undefined,
      });
      alert('Phân công nhân viên phụ trách đơn hàng thành công!');
      setIsAssignModalOpen(false);
      if (onOrderUpdated) {
        onOrderUpdated(res.data || res, {
          syncHandlingAllSiblings: isHandlingEmp,
        });
      }
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
      if (onOrderUpdated) {
        onOrderUpdated(res.data || res, {
          syncHandlingAllSiblings: departmentType === 'handling',
        });
      }
    } catch (err) {
      alert(`Lỗi tự động phân công: ${err.response?.data?.message || err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const modalTitle = isMergedGroup
    ? `Chi tiết Hóa đơn gộp (${subOrders.length} đơn hàng) — Đang chọn Đơn #${selectedSubIndex + 1}: #${shortOrderCode}`
    : `Chi tiết hóa đơn #${shortOrderCode}`;

  const footerContent = (
    <>
      <Button variant="ghost" size="sm" onClick={onClose}>Đóng</Button>
      {onStatusChange && (
        <div className="flex flex-wrap gap-2 ml-auto">
          {order.status === 'pending' && (
            <Button
              size="sm"
              className="bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#2A5C4A] dark:hover:bg-[#35755B] text-white"
              onClick={() => onStatusChange(order.id, 'confirmed')}
            >
              Duyệt đơn #{selectedSubIndex + 1} (Confirmed)
            </Button>
          )}
          {order.status === 'shipping' && (
            <Button
              size="sm"
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
              size="sm"
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
              Duyệt hủy đơn &amp; Hoàn kho (Cancel)
            </Button>
          )}
        </div>
      )}
    </>
  );

  const detailContent = (
    <div className="space-y-4">

          {/* =====================================================================
              NẾU LÀ HÓA ĐƠN GỘP (2+ ĐƠN HÀNG): HIỂN THỊ DANH SÁCH 2 ĐƠN HÀNG RA NGAY ĐẦU MODAL
              ===================================================================== */}
          {isMergedGroup && (
            <div className="rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Hóa đơn gộp gồm {subOrders.length} đơn hàng đặt cùng lượt (Bấm vào từng đơn bên dưới để điều phối chi tiết)
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200 flex flex-wrap items-center gap-3">
                  {batchFin.isPartiallyCancelled ? (
                    <>
                      <span>SL hiệu lực: <strong>{batchFin.activeQty} SP</strong></span>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        Đã hủy {batchFin.cancelledCount} đơn (-{formatCurrency(batchFin.cancelledAmount)})
                      </span>
                      <span>
                        Thực thu ({batchFin.activeCount}/{batchFin.totalSubCount} đơn):{' '}
                        <strong className="text-blue-600 dark:text-blue-400 text-sm">
                          {formatCurrency(batchFin.activeTotalAmount)}
                        </strong>{' '}
                        <span className="line-through text-slate-400 text-[11px]">
                          {formatCurrency(batchFin.originalTotalAmount)}
                        </span>
                      </span>
                    </>
                  ) : batchFin.isAllCancelled ? (
                    <>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        Đã hủy toàn bộ {batchFin.totalSubCount}/{batchFin.totalSubCount} đơn
                      </span>
                      <span>
                        Thực thu: <strong className="text-slate-500 text-sm">0 ₫</strong>{' '}
                        <span className="line-through text-slate-400 text-[11px]">
                          {formatCurrency(batchFin.originalTotalAmount)}
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Tổng SL: <strong>{batchFin.activeQty} SP</strong></span>
                      <span>Tổng tạm tính: <strong>{formatCurrency(batchFin.activeSubtotalAmount)}</strong></span>
                      {batchFin.activeDiscountAmount > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Tổng KM: <strong>-{formatCurrency(batchFin.activeDiscountAmount)}</strong>
                        </span>
                      )}
                      <span>
                        Tổng cộng ({subOrders.length} đơn):{' '}
                        <strong className="text-blue-600 dark:text-blue-400 text-sm">{formatCurrency(batchFin.activeTotalAmount)}</strong>
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {subOrders.map((so, idx) => {
                  const isSelected = idx === selectedSubIndex;
                  const isSoCancelled = so.status === 'cancelled';
                  const soDetails = so.details || [];
                  const soQty = soDetails.reduce((s, d) => s + Number(d.quantity || 0), 0);
                  const soSubtotal = Number(so.subtotalAmount ?? so.totalAmount ?? 0);
                  const soDiscount = Number(so.discountAmount || 0);
                  const soVouchers = so.voucherDetails || [];
                  return (
                    <div
                      key={so.id}
                      onClick={() => setSelectedSubIndex(idx)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1A3A2C] dark:border-[#C9A84C] bg-white dark:bg-slate-900 ring-2 ring-[#2A5C4A]/20 shadow-sm'
                          : isSoCancelled
                            ? 'border-rose-200 dark:border-rose-900/50 bg-white/70 dark:bg-slate-900/40 opacity-80 hover:opacity-100'
                            : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:border-[#2A5C4A]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            isSelected ? 'bg-[#1A3A2C] dark:bg-[#2A5C4A] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            Đơn hàng #{idx + 1}
                          </span>
                          <span
                            className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400"
                            title={so.orderCode || so.id}
                          >
                            #{formatShortOrderCode(so.orderCode || so.id)}
                          </span>
                        </div>
                        <Badge variant={getStatusBadgeVariant(so.status)}>
                          {so.status.toUpperCase()}
                        </Badge>
                      </div>

                      {extractOrderVendors(so).length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-2 text-[11px]">
                          {extractOrderVendors(so).map((v) => (
                            <span
                              key={v.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium"
                            >
                              <Store className="w-3 h-3 shrink-0" />
                              {v.name} <span className="font-mono font-bold">({v.vendorCode})</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Danh sách sản phẩm trong đơn con */}
                      <div className="space-y-1 text-xs border-t border-slate-100 dark:border-slate-800 pt-2">
                        {soDetails.map((d, dIdx) => {
                          const pName = d.productName || d.productVariant?.productColor?.product?.name || 'Sản phẩm';
                          const cName = d.colorName || d.productVariant?.productColor?.color || '';
                          const sName = d.sizeName || d.productVariant?.size || '';
                          return (
                            <div key={d.id || dIdx} className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                              <span className="truncate max-w-[220px]">
                                • {pName} <span className="text-slate-400">({cName}/{sName})</span> <strong>x{d.quantity}</strong>
                              </span>
                              <span className={`font-mono font-medium ${isSoCancelled ? 'line-through text-slate-400' : ''}`}>
                                {formatCurrency(Number(d.price || 0) * Number(d.quantity || 0))}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-500">SL: <strong>{soQty}</strong> • Tạm tính: {formatCurrency(soSubtotal)}</span>
                          {soDiscount > 0 && (
                            <span className="ml-2 text-emerald-600 font-semibold">
                              (KM {soVouchers.map(v => v.voucher?.code).filter(Boolean).join(', ') || 'Voucher'}: -{formatCurrency(soDiscount)})
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          {isSoCancelled ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="line-through text-slate-400 font-semibold">
                                {formatCurrency(so.totalAmount)}
                              </span>
                              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                                (Không thu)
                              </span>
                            </span>
                          ) : (
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(so.totalAmount)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                      Kiện hàng đã chuyển sang trạng thái <strong>Giao thất bại / Đã hoàn hàng</strong>. Bạn có thể nhấn <strong>"Duyệt hủy đơn &amp; Hoàn kho"</strong> bên dưới để hoàn tất quy trình xử lý dừng đơn.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* 1. LÊN ĐẦU: DANH SÁCH SẢN PHẨM TRONG ĐƠN & TỔNG THANH TOÁN / VOUCHER */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-800 dark:text-slate-100 mb-2.5 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600 shrink-0" />
              Sản phẩm trong đơn {isMergedGroup ? `#${selectedSubIndex + 1}` : ''} ({orderItems.length} mặt hàng • SL: {totalQuantity})
            </h4>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {orderItems.map((item, index) => (
                  <div key={index} className="p-3 flex items-start gap-2.5">
                    {item.image ? (
                      <img src={item.image} alt={item.productName} className="w-10 h-10 rounded object-cover border border-slate-200 dark:border-slate-800 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 dark:border-slate-800 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-100 leading-snug">
                        <span className="font-mono text-slate-400 mr-1.5">#{index + 1}</span>
                        {item.productName || 'Sản phẩm'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.colorName} • Size {item.size}
                        {item.productVariant?.sku ? ` • SKU: ${item.productVariant.sku}` : ''}
                      </p>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 flex flex-wrap items-center gap-1">
                        <Store className="w-3 h-3 shrink-0" />
                        <span>{item.vendorName}</span>
                        {item.vendorCode && (
                          <span className="font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-1 rounded border border-indigo-200 dark:border-indigo-800">
                            {item.vendorCode}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          {formatCurrency(item.price)} <strong className="text-slate-700 dark:text-slate-200">x{item.quantity}</strong>
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-3 py-2 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300">
                  Tạm tính (<span className="text-blue-600 dark:text-blue-400 font-bold">{totalQuantity} SP</span>):
                </span>
                <span className="text-slate-800 dark:text-slate-100 font-bold">
                  {formatCurrency(order.subtotalAmount ?? order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Khuyến mãi áp dụng (VoucherDetail) & Tổng thanh toán */}
          <div className="grid grid-cols-1 gap-2.5">
            {/* Voucher Detail Box */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-3 border border-emerald-200/70 dark:border-emerald-900/50 space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <TicketPercent className="w-4 h-4 text-emerald-600 shrink-0" />
                Khuyến mãi áp dụng
              </h5>
              {appliedVouchers.length > 0 ? (
                <div className="space-y-1.5">
                  {appliedVouchers.map((vd, idx) => (
                    <div
                      key={vd.id || idx}
                      className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/70 text-xs flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[10px]">
                            #{vd.sequence || idx + 1}
                          </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                            {vd.voucher?.code || 'VOUCHER'}
                          </span>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                            {vd.voucher?.scope === 'vendor' ? 'Shop' : 'Sàn'}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {vd.voucher?.description || 'Khuyến mãi đơn hàng'} • Đủ ĐK: {formatCurrency(vd.eligibleAmount || 0)}
                        </p>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        -{formatCurrency(vd.discountAmount || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : Number(order.discountAmount) > 0 ? (
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Giảm giá khuyến mãi trực tiếp: <strong>-{formatCurrency(order.discountAmount)}</strong>
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Không áp dụng mã khuyến mãi (Voucher).
                </p>
              )}
            </div>

            {/* Summary Totals */}
            <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Tổng số lượng</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{totalQuantity} sản phẩm</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Tạm tính (Subtotal)</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(order.subtotalAmount ?? order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                <span>Giảm giá khuyến mãi</span>
                <span className="font-semibold">-{formatCurrency(order.discountAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-xs pb-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Phí vận chuyển</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {Number(order.shippingFee) > 0 ? formatCurrency(order.shippingFee) : 'Miễn phí'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {order.status === 'cancelled'
                    ? `${isMergedGroup ? `Đơn #${selectedSubIndex + 1} ` : 'Đơn '}đã hủy (Không thu)`
                    : isMergedGroup
                      ? `Thành tiền đơn #${selectedSubIndex + 1}`
                      : 'Tổng thanh toán'}
                </span>
                {order.status === 'cancelled' ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="line-through text-slate-400 text-xs">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-base">0 ₫</span>
                  </span>
                ) : (
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-base">{formatCurrency(order.totalAmount)}</span>
                )}
              </div>
              {isMergedGroup && (
                <div className="pt-2 border-t border-indigo-200 dark:border-indigo-800 space-y-1">
                  {batchFin.isPartiallyCancelled ? (
                    <>
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Tổng đặt ban đầu ({batchFin.totalSubCount} đơn)</span>
                        <span className="line-through">{formatCurrency(batchFin.originalTotalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-rose-600 dark:text-rose-400 font-medium">
                        <span>Trừ đơn đã hủy ({batchFin.cancelledCount} đơn)</span>
                        <span>-{formatCurrency(batchFin.cancelledAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          Thực thu còn lại ({batchFin.activeCount}/{batchFin.totalSubCount} đơn)
                        </span>
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-base">
                          {formatCurrency(batchFin.activeTotalAmount)}
                        </span>
                      </div>
                    </>
                  ) : batchFin.isAllCancelled ? (
                    <>
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Tổng đặt ban đầu ({batchFin.totalSubCount} đơn)</span>
                        <span className="line-through">{formatCurrency(batchFin.originalTotalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                          Thực thu (Đã hủy {batchFin.totalSubCount}/{batchFin.totalSubCount} đơn)
                        </span>
                        <span className="font-extrabold text-slate-500 dark:text-slate-400 text-base">
                          0 ₫
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        Tổng cả {subOrders.length} đơn gộp
                      </span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-base">
                        {formatCurrency(batchFin.activeTotalAmount)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 2. Ở GIỮA: KHỐI HỢP NHẤT NHÂN SỰ (3 BAN NGHIỆ VỤ) & KIỆN HÀNG VẬN CHUYỂN NỘI BỘ */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Nhân sự &amp; Vận chuyển {isMergedGroup ? `đơn #${selectedSubIndex + 1}` : 'nội bộ'}
                </h4>
                {shipments.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {shipments.length} kiện
                  </span>
                )}
              </div>
              {isEditable && (
                <button
                  type="button"
                  onClick={() => handleOpenAssignModal()}
                  disabled={assigning}
                  className="px-2.5 py-1 rounded-lg bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#2A5C4A] dark:hover:bg-[#35755B] text-white text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs transition shrink-0"
                >
                  <UserCheck className="w-3 h-3" />
                  Phân công
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Ban 1: Điều phối & Liên kết Vendor */}
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    1. Điều phối &amp; Vendor
                  </span>
                  {isEditable ? (
                    <div className="flex items-center gap-1.5 text-[11px] shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenAssignModal(assignedHandling?.id)}
                        disabled={assigning}
                        className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
                        title="Đổi điều phối viên dùng chung cho cả đơn hàng"
                      >
                        Đổi
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <button
                        type="button"
                        onClick={() => handleAutoAssign('handling')}
                        disabled={assigning}
                        className="font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 inline-flex items-center gap-0.5"
                        title="Tự động phân công điều phối viên"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        Auto
                      </button>
                    </div>
                  ) : (
                    assignedHandling && <Badge variant="success" size="sm">Đã giao</Badge>
                  )}
                </div>

                {assignedHandling ? (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {assignedHandling.fullName?.charAt(0) || 'Đ'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                        {assignedHandling.fullName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {assignedHandling.employeeCode}
                        {assignedHandling.phone ? ` • ${assignedHandling.phone}` : ''}
                        {isMergedGroup ? ` • Chung ${subOrders.length} đơn` : ''}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Chưa chỉ định điều phối {isMergedGroup ? `(chung ${subOrders.length} đơn)` : ''}
                  </p>
                )}
              </div>

              {/* Ban 2 + Kiện hàng & Vận chuyển nội bộ (Đã gộp) */}
              <div className="p-2.5 rounded-xl border border-blue-200/80 dark:border-blue-800/60 bg-white dark:bg-slate-800/80 shadow-xs flex flex-col justify-between gap-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      2. Bưu tá &amp; Kiện hàng
                    </span>
                    {isEditable ? (
                      <div className="flex items-center gap-1.5 text-[11px] shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModal(assignedShipper?.id)}
                          disabled={assigning}
                          className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                          title="Chỉnh lại bưu tá giao nhận phụ trách đơn này"
                        >
                          Đổi
                        </button>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <button
                          type="button"
                          onClick={() => handleAutoAssign('shipping')}
                          disabled={assigning}
                          className="font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 inline-flex items-center gap-0.5"
                          title="Hệ thống tự động phân công bưu tá"
                        >
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          Auto
                        </button>
                      </div>
                    ) : (
                      assignedShipper && <Badge variant="success" size="sm">Đã giao</Badge>
                    )}
                  </div>

                  {assignedShipper ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {assignedShipper.fullName?.charAt(0) || 'S'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                          {assignedShipper.fullName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {assignedShipper.employeeCode}
                          {assignedShipper.phone ? ` • ${assignedShipper.phone}` : ''}
                          {isMergedGroup ? ` • Riêng đơn #${selectedSubIndex + 1}` : ''}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                      Chưa phân công bưu tá
                    </p>
                  )}
                </div>

                {/* Thông tin Kiện hàng & Vận chuyển nội bộ tích hợp trực tiếp */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/70 space-y-1.5">
                  {shipments.length > 0 ? (
                    shipments.map((shipment) => {
                      const hasDifferentCarrier =
                        shipment.carrier &&
                        (!assignedShipper || shipment.carrier.id !== assignedShipper.id);
                      return (
                        <div
                          key={shipment.id}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">
                              {shipment.trackingNumber || `SP-${shipment.id.slice(0, 8)}`}
                            </span>
                            <Badge variant={getShipmentBadgeVariant(shipment.status)}>
                              {getShipmentStatusText(shipment.status)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 shrink-0" />
                              {formatDate(shipment.updatedAt || shipment.createdAt)}
                            </span>
                            {hasDifferentCarrier && (
                              <span className="font-medium text-slate-600 dark:text-slate-300">
                                {shipment.carrier.fullName}
                              </span>
                            )}
                          </div>
                          {shipment.failedReason && (
                            <p className="text-[11px] text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded border border-red-200/70 dark:border-red-900/50">
                              Lý do thất bại: {shipment.failedReason}
                            </p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      Chưa khởi tạo kiện vận chuyển nội bộ
                    </p>
                  )}
                </div>
              </div>

              {/* Ban 3: Xử lý Sự cố & Ngoại lệ */}
              <div className={`p-2.5 rounded-xl border shadow-xs flex flex-col justify-between gap-2 ${
                assignedException 
                  ? 'border-amber-300 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20' 
                  : (showEscalationAlert || order.status === 'cancelled')
                    ? 'border-red-300 dark:border-red-800/60 bg-red-50/40 dark:bg-red-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80'
              }`}>
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    3. Sự cố &amp; Ngoại lệ
                  </span>
                  {isEditable && (showEscalationAlert || assignedException) ? (
                    <div className="flex items-center gap-1.5 text-[11px] shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenAssignModal(assignedException?.id)}
                        disabled={assigning}
                        className="font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline"
                      >
                        Đổi
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <button
                        type="button"
                        onClick={() => handleAutoAssign('exception')}
                        disabled={assigning}
                        className="font-medium text-slate-500 hover:text-amber-600 dark:text-slate-400 inline-flex items-center gap-0.5"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Auto
                      </button>
                    </div>
                  ) : (
                    assignedException && <Badge variant="warning" size="sm">Đang xử lý</Badge>
                  )}
                </div>

                {assignedException ? (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {assignedException.fullName?.charAt(0) || 'E'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                        {assignedException.fullName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {assignedException.employeeCode} {assignedException.phone ? `• ${assignedException.phone}` : ''}
                      </p>
                    </div>
                  </div>
                ) : (showEscalationAlert || order.status === 'cancelled') ? (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Có sự cố (chờ chỉ định)
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">Không phát sinh sự cố</p>
                )}
              </div>
            </div>
          </div>

          {/* 3. Ở DƯỚI CÙNG: THÔNG TIN NGƯỜI NHẬN & THÔNG TIN ĐƠN HÀNG */}
          <div className="grid grid-cols-1 gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Thông tin người nhận
              </h4>
              <div className="space-y-1.5 text-xs">
                <p><span className="text-slate-500 dark:text-slate-400">Họ tên:</span> <span className="font-semibold text-slate-800 dark:text-slate-100">{rawOrder.userName || order.client?.fullName || order.receiverName || 'Khách hàng'}</span></p>
                {(order.receiverPhone || order.client?.phone) && <p><span className="text-slate-500 dark:text-slate-400">Số ĐT:</span> <span className="font-mono font-medium text-slate-800 dark:text-slate-100">{order.receiverPhone || order.client?.phone}</span></p>}
                {order.client?.email && <p><span className="text-slate-500 dark:text-slate-400">Email:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{order.client.email}</span></p>}
                <p className="flex items-start gap-1 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-800 dark:text-slate-100">{order.shippingAddress || 'Chưa cung cấp địa chỉ'}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Thông tin đơn hàng {isMergedGroup ? `(#${selectedSubIndex + 1} / ${subOrders.length})` : ''}
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p>
                    <span className="text-slate-500 dark:text-slate-400">Mã đơn:</span>{' '}
                    <span
                      className="font-mono font-semibold text-blue-600 dark:text-blue-400"
                      title={fullOrderCode}
                    >
                      #{shortOrderCode}
                    </span>
                  </p>
                  <Badge variant={getStatusBadgeVariant(order.status)}>{order.status.toUpperCase()}</Badge>
                </div>
                <p><span className="text-slate-500 dark:text-slate-400">Ngày tạo:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{formatDate(order.createdAt)}</span></p>
                <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Gian hàng cung cấp (Vendor):</span>
                  {orderVendors.length > 0 ? (
                    <div className="space-y-1">
                      {orderVendors.map((v) => (
                        <div key={v.id} className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-100">
                            <Store className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            {v.name}
                          </span>
                          <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {v.vendorCode}
                          </span>
                          {v.vendorOrderCode && (
                            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                              • Kiện: {v.vendorOrderCode}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Đơn trực thuộc hệ thống MIVA</span>
                  )}
                </div>
                <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Thanh toán: </span>
                    <span className="font-semibold uppercase text-slate-700 dark:text-slate-300">
                      {order.payment?.method || order.paymentMethod || 'COD'}
                    </span>
                  </div>
                  <div>
                    {getPaymentStatusBadge(order.payment?.status)}
                    {order.payment?.paidAt && (
                      <span className="block text-[10px] text-slate-400 text-right mt-0.5">
                        {formatDate(order.payment.paidAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

    </div>
  );

  return (
    <>
      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:sticky lg:top-0 lg:max-h-[calc(100vh-8rem)]">
        <div className="flex items-start justify-between gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white leading-snug">
            {modalTitle}
          </h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              title="Đóng chi tiết đơn hàng"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {detailContent}
        </div>
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-b-xl flex flex-wrap items-center justify-end gap-2 shrink-0">
          {footerContent}
        </div>
      </div>

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

            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <p className="font-semibold" title={fullOrderCode}>Mã đơn: #{shortOrderCode}</p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400">
                Người nhận: {order.receiverName || order.client?.fullName} • {order.receiverPhone || ''}
              </p>
              {isMergedGroup && (
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                  * Lưu ý: Ban Điều phối &amp; Vendor sẽ áp dụng chung cho cả {subOrders.length} đơn con; Bưu tá chỉ áp dụng cho Đơn #{selectedSubIndex + 1}.
                </p>
              )}
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
                  className="px-4 py-2 bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#2A5C4A] dark:hover:bg-[#35755B] text-white rounded-xl font-semibold shadow-xs transition"
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
