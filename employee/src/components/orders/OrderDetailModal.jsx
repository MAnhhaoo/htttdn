import {
  X,
  User,
  CreditCard,
  CheckCircle2,
  AlertOctagon,
  Send,
  AlertTriangle,
  History,
  Store,
  ShieldCheck,
  Package,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatShortOrderCode } from '../../utils/orderFormat';

const STATUS_CONFIG = {
  pending: {
    label: 'Chờ xác nhận',
    color:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  },
  confirmed: {
    label: 'Đã xác nhận',
    color:
      'bg-[#EEF5F1] text-[#1A3A2C] border-[#B9D6C6] dark:bg-[#1A3A2C]/50 dark:text-[#8BBAA1] dark:border-[#2A5C4A]',
  },
  processing: {
    label: 'Vendor đang xử lý',
    color:
      'bg-[#FBF7EC] text-[#8C6B1F] border-[#E6D39A] dark:bg-[#C9A84C]/15 dark:text-[#DEC47E] dark:border-[#C9A84C]/35',
  },
  shipping: {
    label: 'Đang vận chuyển',
    color:
      'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30',
  },
  completed: {
    label: 'Đã hoàn thành',
    color:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  cancelled: {
    label: 'Đã hủy / Từ chối',
    color:
      'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
  },
};

const getActorBadge = (actorRole) => {
  if (actorRole?.includes('Nhân viên')) {
    return 'bg-[#EEF5F1] text-[#1A3A2C] border-[#B9D6C6] dark:bg-[#1A3A2C]/50 dark:text-[#8BBAA1] dark:border-[#2A5C4A]';
  }
  if (actorRole?.includes('Admin')) {
    return 'bg-[#FBF7EC] text-[#8C6B1F] border-[#E6D39A] dark:bg-[#C9A84C]/15 dark:text-[#DEC47E] dark:border-[#C9A84C]/35';
  }
  if (actorRole?.includes('Vendor')) {
    return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30';
  }
  if (actorRole?.includes('Khách hàng')) {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
};

export const OrderDetailModal = ({
  order,
  user: propUser,
  isOpen,
  onClose,
  onOpenConfirm,
  onOpenReject,
  onOpenTransfer,
  onOpenException,
}) => {
  const { user: authUser } = useAuth();
  const currentUser = propUser || authUser;

  if (!isOpen || !order) return null;

  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  const canDispatch =
    currentUser?.department?.includes('Điều phối') || currentUser?.role === 'admin';
  const canHandleException =
    currentUser?.department?.includes('Sự cố') || currentUser?.role === 'admin';

  const showConfirmBtn = order.status === 'pending' && canDispatch;
  const showRejectBtn = order.status === 'pending' && canHandleException;
  const showTransferBtn = order.status === 'confirmed' && canDispatch;
  const showExceptionBtn = canHandleException;
  const hasAnyAction = showConfirmBtn || showRejectBtn || showTransferBtn || showExceptionBtn;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#131B17] rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#EEF5F1] text-[#1A3A2C] dark:bg-[#1A3A2C]/60 dark:text-[#DEC47E] rounded-xl border border-[#B9D6C6]/60 dark:border-[#2A5C4A]/60">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Chi Tiết Đơn Hàng
                </h3>
                <span
                  className="font-mono font-bold text-sm text-[#1A3A2C] dark:text-[#DEC47E] bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded"
                  title={order.orderCode || order.id}
                >
                  #{formatShortOrderCode(order.orderCode || order.id)}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Khởi tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#EEF5F1]/70 dark:bg-[#1A3A2C]/25 border border-[#B9D6C6] dark:border-[#2A5C4A]/50 rounded-xl">
            <div className="flex items-center space-x-2 text-xs text-[#1A3A2C] dark:text-[#B9D6C6] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#2A5C4A] dark:text-[#DEC47E] shrink-0" />
              <span>
                Thao tác trong phạm vi quyền hạn ({currentUser?.department || 'Nhân viên'}):
              </span>
            </div>
            {hasAnyAction ? (
              <div className="flex flex-wrap items-center gap-2">
                {showConfirmBtn && (
                  <button
                    type="button"
                    onClick={() => onOpenConfirm?.(order)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition flex items-center space-x-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Xác nhận đơn</span>
                  </button>
                )}

                {showRejectBtn && (
                  <button
                    type="button"
                    onClick={() => onOpenReject?.(order)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition flex items-center space-x-1 cursor-pointer"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Từ chối theo quy tắc</span>
                  </button>
                )}

                {showTransferBtn && (
                  <button
                    type="button"
                    onClick={() => onOpenTransfer?.(order)}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#2A5C4A] dark:hover:bg-[#35755B] rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#DEC47E]" />
                    <span>Chuyển đơn cho Vendor</span>
                  </button>
                )}

                {showExceptionBtn && (
                  <button
                    type="button"
                    onClick={() => onOpenException?.(order)}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/15 hover:bg-amber-200 dark:hover:bg-amber-500/25 rounded-lg border border-amber-300 dark:border-amber-500/35 transition flex items-center space-x-1 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Xử lý / Báo sự cố</span>
                  </button>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                Chế độ tra cứu thông tin theo trạng thái &amp; phân quyền bộ phận
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1713] space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                <User className="w-4 h-4 text-[#2A5C4A] dark:text-[#DEC47E]" />
                <span>Thông tin người nhận</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                <p>
                  <span className="text-slate-400">Họ và tên:</span>{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {order.receiverName}
                  </span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <span className="text-slate-400">Số điện thoại:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {order.receiverPhone}
                  </span>
                </p>
                <p className="flex items-start space-x-1.5">
                  <span className="text-slate-400 shrink-0">Địa chỉ giao:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {order.shippingAddress}
                  </span>
                </p>
                {order.notes && (
                  <p className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg text-slate-600 dark:text-slate-300 italic border border-slate-100 dark:border-slate-700">
                    Ghi chú khách: &ldquo;{order.notes}&rdquo;
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1713] space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Thanh toán &amp; Đơn vị phụ trách</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                <p>
                  <span className="text-slate-400">Hình thức:</span>{' '}
                  <span className="font-semibold uppercase font-mono text-slate-900 dark:text-white">
                    {order.paymentMethod === 'cod'
                      ? 'Thanh toán khi nhận hàng (COD)'
                      : 'Chuyển khoản / Trực tuyến'}
                  </span>
                </p>
                <p>
                  <span className="text-slate-400">Trạng thái thanh toán:</span>{' '}
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                    }`}
                  >
                    {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thu tiền'}
                  </span>
                </p>
                {order.orderVendors?.length > 0 ? (
                  <div className="mt-2 space-y-1.5">
                    {order.orderVendors.map((v) => (
                      <div
                        key={v.id}
                        className="p-2 bg-[#EEF5F1]/70 dark:bg-[#1A3A2C]/30 border border-[#B9D6C6] dark:border-[#2A5C4A]/60 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-[#1A3A2C] dark:text-white flex items-center space-x-1">
                            <Store className="w-3.5 h-3.5 text-[#2A5C4A] dark:text-[#DEC47E] shrink-0" />
                            <span>{v.name}</span>
                          </p>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-[#0F1713] text-[#1A3A2C] dark:text-[#DEC47E] border border-[#B9D6C6] dark:border-[#2A5C4A] font-semibold">
                            {v.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-[#A3B8AE] mt-0.5">
                          Kho: {v.region} • Hotline: {v.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : order.assignedVendor ? (
                  <div className="mt-2 p-2 bg-[#EEF5F1]/70 dark:bg-[#1A3A2C]/30 border border-[#B9D6C6] dark:border-[#2A5C4A]/60 rounded-lg">
                    <p className="font-bold text-[#1A3A2C] dark:text-white flex items-center space-x-1">
                      <Store className="w-3.5 h-3.5 text-[#2A5C4A] dark:text-[#DEC47E]" />
                      <span>{order.assignedVendor.name}</span>
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-[#A3B8AE] mt-0.5">
                      Trạng thái kho: {order.assignedVendor.vendorStatus}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">
                    Chưa chỉ định Vendor (Đang chờ điều phối)
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1713]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-white">
                <UserCheck className="w-4 h-4 text-[#2A5C4A] dark:text-[#DEC47E]" />
                <span>Nhân sự phụ trách đơn hàng theo 3 ban nghiệp vụ MIVA</span>
              </div>
            </div>

            <div
              className={`grid grid-cols-1 ${
                order.exceptionEmployee || order.exception ? 'md:grid-cols-3' : 'md:grid-cols-2'
              } gap-3 mt-3`}
            >
              <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/70">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A3A2C] dark:text-[#DEC47E] bg-[#EEF5F1] dark:bg-[#1A3A2C]/50 px-2 py-0.5 rounded border border-[#B9D6C6] dark:border-[#2A5C4A]">
                  1. Ban Điều phối &amp; Vendor
                </span>
                {order.handlingEmployee ? (
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="w-9 h-9 rounded-full bg-[#1A3A2C] text-[#DEC47E] flex items-center justify-center font-bold text-sm shrink-0">
                      {order.handlingEmployee.fullName?.slice(0, 1) || 'H'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">
                          {order.handlingEmployee.fullName}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-[#8C6B1F] dark:text-[#DEC47E] bg-[#FBF7EC] dark:bg-[#C9A84C]/15 px-1 py-0.2 rounded border border-[#E6D39A] dark:border-[#C9A84C]/35">
                          {order.handlingEmployee.employeeCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        <strong className="text-slate-800 dark:text-slate-300 font-semibold">
                          {order.handlingEmployee.department}
                        </strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic mt-2">
                    Chờ chuyên viên điều phối tiếp nhận
                  </p>
                )}
              </div>

              <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/70">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                  2. Bưu tá Giao hàng
                </span>
                {order.assignedCarrier ? (
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                      {order.assignedCarrier.fullName?.slice(0, 1) || 'S'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">
                          {order.assignedCarrier.fullName}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 px-1 py-0.2 rounded border border-emerald-100 dark:border-emerald-500/30">
                          {order.assignedCarrier.employeeCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        <strong className="text-slate-800 dark:text-slate-300 font-semibold">
                          {order.assignedCarrier.department || 'Phòng Vận chuyển & Giao nhận'}
                        </strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic mt-2">
                    Chờ hệ thống phân công bưu tá
                  </p>
                )}
              </div>

              {(order.exceptionEmployee || order.exception) && (
                <div className="bg-rose-50/60 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-200 dark:border-rose-500/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-500/20 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-500/30">
                    3. Ban Xử lý Sự cố &amp; Ngoại lệ
                  </span>
                  {order.exceptionEmployee ? (
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-500/25 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-sm shrink-0">
                        {order.exceptionEmployee.fullName?.slice(0, 1) || 'E'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-800 dark:text-white">
                            {order.exceptionEmployee.fullName}
                          </span>
                          <span className="text-[10px] font-mono font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/15 px-1 py-0.2 rounded border border-rose-200 dark:border-rose-500/30">
                            {order.exceptionEmployee.employeeCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          <strong className="text-slate-800 dark:text-slate-300 font-semibold">
                            {order.exceptionEmployee.department}
                          </strong>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-rose-600 dark:text-rose-300 font-medium mt-2">
                      Đơn có phát sinh sự cố • Đang chuyển giao Ban Xử lý Sự cố
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">
              Danh sách sản phẩm trong đơn ({order.details?.length || 0})
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-[#0F1713]">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Sản phẩm</th>
                    <th className="py-2.5 px-3">Phân loại</th>
                    <th className="py-2.5 px-3 text-center">Số lượng</th>
                    <th className="py-2.5 px-3 text-right">Đơn giá</th>
                    <th className="py-2.5 px-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {order.details?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white line-clamp-1">
                              {item.productName}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {item.vendorName || 'Kho trung tâm'}
                              {item.vendorCode ? (
                                <span className="ml-1.5 font-mono font-semibold text-[#1A3A2C] dark:text-[#DEC47E] bg-[#EEF5F1] dark:bg-[#1A3A2C]/50 px-1 rounded">
                                  {item.vendorCode}
                                </span>
                              ) : null}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {item.colorName} • Size {item.sizeName}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800 dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                        {item.price?.toLocaleString()} đ
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {(item.price * item.quantity)?.toLocaleString()} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bg-slate-50/60 dark:bg-slate-800/50 p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Tạm tính:</span>
                    <span>{order.subtotalAmount?.toLocaleString()} đ</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Giảm giá Voucher:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      -{order.discountAmount?.toLocaleString()} đ
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Phí vận chuyển:</span>
                    <span>+{order.shippingFee?.toLocaleString()} đ</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-700">
                    <span>Tổng thanh toán:</span>
                    <span className="text-[#1A3A2C] dark:text-[#DEC47E]">
                      {order.totalAmount?.toLocaleString()} đ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3">
              <History className="w-4 h-4 text-[#2A5C4A] dark:text-[#DEC47E]" />
              <span>Lịch sử trạng thái &amp; Kiểm toán</span>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-[#0F1713] space-y-4">
              {order.statusHistory?.map((hist, idx) => (
                <div key={hist.id || idx} className="flex items-start space-x-3 text-xs relative">
                  {idx < order.statusHistory.length - 1 && (
                    <div className="absolute left-2.5 top-5 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
                  )}
                  <div className="w-5 h-5 rounded-full bg-[#1A3A2C] dark:bg-[#2A5C4A] text-[#DEC47E] flex items-center justify-center text-[10px] font-bold shrink-0 z-10">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/70">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded-full font-bold border ${getActorBadge(
                            hist.actorRole,
                          )}`}
                        >
                          {hist.actorRole || 'Hệ thống'}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-white">
                          {hist.actorName || hist.clientId || 'Hệ thống'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(hist.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span>Trạng thái:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase font-mono">
                        {hist.fromStatus || 'Khởi tạo'}
                      </span>
                      <span>→</span>
                      <span className="font-bold text-[#1A3A2C] dark:text-[#DEC47E] uppercase font-mono">
                        {hist.toStatus}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-xs italic bg-white dark:bg-[#0F1713] p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      &ldquo;{hist.note || 'Không có ghi chú thêm'}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition shadow-2xs cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
