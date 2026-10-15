import React from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  AlertOctagon, 
  Send, 
  AlertTriangle, 
  History, 
  Store, 
  ShieldCheck,
  Clock,
  Package,
  UserCheck
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  processing: { label: 'Vendor đang xử lý', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  shipping: { label: 'Đang vận chuyển', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  completed: { label: 'Đã hoàn thành', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'Đã hủy / Từ chối', color: 'bg-rose-100 text-rose-800 border-rose-200' },
};

const getActorBadge = (actorRole) => {
  if (actorRole?.includes('Nhân viên')) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  if (actorRole?.includes('Admin')) {
    return 'bg-purple-100 text-purple-800 border-purple-200';
  }
  if (actorRole?.includes('Vendor')) {
    return 'bg-indigo-100 text-indigo-800 border-indigo-200';
  }
  if (actorRole?.includes('Khách hàng')) {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export const OrderDetailModal = ({
  order,
  isOpen,
  onClose,
  onOpenConfirm,
  onOpenReject,
  onOpenTransfer,
  onOpenException,
}) => {
  if (!isOpen || !order) return null;

  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-800 text-base">Chi Tiết Đơn Hàng</h3>
                <span className="font-mono font-bold text-sm text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                  {order.orderCode}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Khởi tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Action Reminder Banner for Employee */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl">
            <div className="flex items-center space-x-2 text-xs text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Thao tác trong phạm vi quyền hạn nhân viên:
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={() => onOpenConfirm(order)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Xác nhận đơn</span>
                  </button>
                  <button
                    onClick={() => onOpenReject(order)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition flex items-center space-x-1"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Từ chối theo quy tắc</span>
                  </button>
                </>
              )}

              {order.status === 'confirmed' && (
                <button
                  onClick={() => onOpenTransfer(order)}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Chuyển đơn cho Vendor</span>
                </button>
              )}

              <button
                onClick={() => onOpenException(order)}
                className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg border border-amber-300 transition flex items-center space-x-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Xử lý / Báo sự cố</span>
              </button>
            </div>
          </div>

          {/* Customer & Delivery Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Thông tin người nhận</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-700">
                <p><span className="text-slate-400">Họ và tên:</span> <span className="font-semibold text-slate-900">{order.receiverName}</span></p>
                <p className="flex items-center space-x-1.5">
                  <span className="text-slate-400">Số điện thoại:</span>
                  <span className="font-semibold text-slate-900">{order.receiverPhone}</span>
                </p>
                <p className="flex items-start space-x-1.5">
                  <span className="text-slate-400 shrink-0">Địa chỉ giao:</span>
                  <span className="font-medium text-slate-800">{order.shippingAddress}</span>
                </p>
                {order.notes && (
                  <p className="bg-slate-50 p-2 rounded-lg text-slate-600 italic border border-slate-100">
                    Ghi chú khách: "{order.notes}"
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Thanh toán & Đơn vị phụ trách</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-700">
                <p>
                  <span className="text-slate-400">Hình thức:</span>{' '}
                  <span className="font-semibold uppercase font-mono">
                    {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản / Trực tuyến'}
                  </span>
                </p>
                <p>
                  <span className="text-slate-400">Trạng thái thanh toán:</span>{' '}
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thu tiền'}
                  </span>
                </p>
                {order.orderVendors?.length > 0 ? (
                  <div className="mt-2 space-y-1.5">
                    {order.orderVendors.map((v) => (
                      <div key={v.id} className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-indigo-900 flex items-center space-x-1">
                            <Store className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>{v.name}</span>
                          </p>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold">
                            {v.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-indigo-700 mt-0.5">
                          Kho: {v.region} • Hotline: {v.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : order.assignedVendor ? (
                  <div className="mt-2 p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <p className="font-bold text-indigo-900 flex items-center space-x-1">
                      <Store className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{order.assignedVendor.name}</span>
                    </p>
                    <p className="text-[11px] text-indigo-700 mt-0.5">
                      Trạng thái kho: {order.assignedVendor.vendorStatus}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">Chưa chỉ định Vendor (Đang chờ điều phối)</p>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Employee Section */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Nhân viên phụ trách xử lý đơn</span>
              </div>
              {order.assignedCarrier ? (
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Đã phân công
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Chờ phân công
                </span>
              )}
            </div>

            {order.assignedCarrier ? (
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {order.assignedCarrier.fullName?.slice(0, 1) || 'E'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800">{order.assignedCarrier.fullName}</span>
                      <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                        {order.assignedCarrier.employeeCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap gap-x-3">
                      <span>Phòng ban: <strong className="text-slate-700">{order.assignedCarrier.department || 'Vận hành'}</strong></span>
                      {order.assignedCarrier.phoneNumber && (
                        <span>SĐT: <strong className="text-slate-700">{order.assignedCarrier.phoneNumber}</strong></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-400 italic">
                Đơn hàng này chưa có nhân viên phụ trách cụ thể. Hệ thống sẽ tự động phân công khi xác nhận hoặc Admin có thể can thiệp phân công.
              </p>
            )}
          </div>

          {/* Product Items Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Danh sách sản phẩm trong đơn ({order.details?.length || 0})
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Sản phẩm</th>
                    <th className="py-2.5 px-3">Phân loại</th>
                    <th className="py-2.5 px-3 text-center">Số lượng</th>
                    <th className="py-2.5 px-3 text-right">Đơn giá</th>
                    <th className="py-2.5 px-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.details?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">{item.productName}</p>
                            <p className="text-[11px] text-slate-400">{item.vendorName || 'Kho trung tâm'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.colorName} • Size {item.sizeName}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">
                        {item.price?.toLocaleString()} đ
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {(item.price * item.quantity)?.toLocaleString()} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bg-slate-50/60 p-4 border-t border-slate-200 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính:</span>
                    <span>{order.subtotalAmount?.toLocaleString()} đ</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Giảm giá Voucher:</span>
                    <span className="text-emerald-600">-{order.discountAmount?.toLocaleString()} đ</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Phí vận chuyển:</span>
                    <span>+{order.shippingFee?.toLocaleString()} đ</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                    <span>Tổng thanh toán:</span>
                    <span className="text-blue-700">{order.totalAmount?.toLocaleString()} đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline History */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              <History className="w-4 h-4 text-blue-600" />
              <span>Lịch sử trạng thái & Kiểm toán (Status History Audit Log)</span>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-4">
              {order.statusHistory?.map((hist, idx) => (
                <div key={hist.id || idx} className="flex items-start space-x-3 text-xs relative">
                  {idx < order.statusHistory.length - 1 && (
                    <div className="absolute left-2.5 top-5 bottom-0 w-0.5 bg-slate-200" />
                  )}
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 z-10">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold border ${getActorBadge(hist.actorRole)}`}>
                          {hist.actorRole || 'Hệ thống'}
                        </span>
                        <span className="font-bold text-slate-800">{hist.actorName || hist.clientId || 'Hệ thống'}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(hist.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mb-1">
                      <span>Trạng thái:</span>
                      <span className="font-semibold text-slate-700 uppercase font-mono">{hist.fromStatus || 'Khởi tạo'}</span>
                      <span>→</span>
                      <span className="font-bold text-blue-700 uppercase font-mono">{hist.toStatus}</span>
                    </div>
                    <p className="text-slate-700 text-xs italic bg-white p-2 rounded-lg border border-slate-100">
                      "{hist.note || 'Không có ghi chú thêm'}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/70 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition shadow-2xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
