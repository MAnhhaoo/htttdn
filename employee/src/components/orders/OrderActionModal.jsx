import { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Package,
  Send,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react';
import { useToast } from '@shared/components/ui';
import { ordersApi } from '../../api/axiosClient';
import { REJECTION_RULES } from '../../constants/rules';
import { formatShortOrderCode, formatVendorCode } from '../../utils/orderFormat';

function extractOrderVendors(order) {
  if (order?.orderVendors && order.orderVendors.length > 0) {
    return order.orderVendors;
  }
  const map = new Map();
  (order?.details || []).forEach((d) => {
    const vId = d.vendorId;
    if (vId && !map.has(vId)) {
      map.set(vId, {
        id: vId,
        name: d.vendorName || `Gian hàng đối tác (${vId.slice(0, 8)})`,
        storeName: d.vendorName || 'Gian hàng đối tác',
        code: formatVendorCode(vId, d.vendorCode),
        phone: '0900000000',
        region: 'Kho hàng đối tác MIVA',
        slaHours: 12,
      });
    }
  });
  return Array.from(map.values());
}

const MODAL_META = {
  confirm: {
    title: 'Xác Nhận Đơn Hàng',
    headerClass: 'bg-slate-50/70 dark:bg-slate-800/60',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  reject: {
    title: 'Từ Chối Đơn Chưa Xác Nhận Theo Quy Tắc',
    headerClass: 'bg-rose-50/50 dark:bg-rose-950/30',
    iconClass: 'text-rose-600 dark:text-rose-400',
    Icon: AlertOctagon,
  },
  transfer: {
    title: 'Bàn Giao Đơn Cho Đối Tác Bán Hàng',
    headerClass: 'bg-[#EEF5F1]/80 dark:bg-[#1A3A2C]/35',
    iconClass: 'text-[#1A3A2C] dark:text-[#DEC47E]',
    Icon: Send,
  },
  exception: {
    title: 'Xử Lý & Chuyển Tiếp Sự Cố Đơn Hàng',
    headerClass: 'bg-amber-50/50 dark:bg-amber-950/25',
    iconClass: 'text-amber-700 dark:text-amber-400',
    Icon: AlertTriangle,
  },
};

function OrderActionModalBody({ order, mode, onClose, onSuccess }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const orderVendors = useMemo(() => extractOrderVendors(order), [order]);

  // Confirm state
  const [confirmNote, setConfirmNote] = useState(
    'Đã kiểm tra tồn kho và liên hệ khách hàng xác nhận hợp lệ.',
  );
  const [isStockChecked, setIsStockChecked] = useState(true);
  const [isCustomerChecked, setIsCustomerChecked] = useState(true);

  // Reject state
  const [selectedRule, setSelectedRule] = useState(REJECTION_RULES[0]?.code || 'OUT_OF_STOCK');
  const [rejectNote, setRejectNote] = useState('');
  const [confirmedRejectCheck, setConfirmedRejectCheck] = useState(false);

  // Transfer state
  const [selectedVendorId, setSelectedVendorId] = useState(orderVendors[0]?.id || null);
  const [slaHours, setSlaHours] = useState(orderVendors[0]?.slaHours || 12);
  const [transferNote, setTransferNote] = useState(
    'Đơn đã xác nhận thành công. Vui lòng đóng gói và in phiếu gửi trước thời hạn.',
  );

  // Exception state
  const [exceptionTab, setExceptionTab] = useState('resolve');
  const [resolveType, setResolveType] = useState('URGE_VENDOR');
  const [resolveNote, setResolveNote] = useState('');
  const [escalateReason, setEscalateReason] = useState('REFUND_OVER_LIMIT');
  const [escalatePriority, setEscalatePriority] = useState('high');
  const [escalateNote, setEscalateNote] = useState('');

  const meta = MODAL_META[mode] || MODAL_META.confirm;
  const HeaderIcon = meta.Icon;
  const shortCode = formatShortOrderCode(order.orderCode || order.id);

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    if (!isStockChecked || !isCustomerChecked) {
      toast.error('Vui lòng hoàn tất danh mục kiểm tra trước khi xác nhận đơn!');
      return;
    }
    try {
      setSubmitting(true);
      await ordersApi.updateStatus(order.id, {
        status: 'confirmed',
        note: confirmNote.trim(),
      });
      toast.success(`Đã xác nhận đơn hàng #${shortCode} thành công!`);
      await onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(`Lỗi xác nhận đơn: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (order.status !== 'pending') {
      toast.error('Chỉ được phép từ chối đơn hàng đang ở trạng thái Chờ xác nhận!');
      return;
    }
    if (!confirmedRejectCheck) {
      toast.error('Vui lòng đánh dấu xác nhận việc áp dụng quy tắc từ chối!');
      return;
    }
    const ruleObj = REJECTION_RULES.find((r) => r.code === selectedRule);
    const formattedNote = `[Quy tắc: ${ruleObj?.title || selectedRule}] ${rejectNote.trim()}`;
    try {
      setSubmitting(true);
      await ordersApi.updateStatus(order.id, {
        status: 'cancelled',
        note: formattedNote,
      });
      toast.success(`Đã từ chối đơn hàng #${shortCode} theo quy tắc vận hành.`);
      await onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(`Lỗi từ chối đơn: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    const vendor = orderVendors.find((v) => v.id === selectedVendorId) || orderVendors[0];
    if (!vendor) {
      toast.error('Đơn hàng không chứa thông tin đối tác Vendor hợp lệ.');
      return;
    }
    const fullNote = `[Chuyển Vendor: ${vendor.name} (${vendor.code})] SLA: ${slaHours}h. Ghi chú: ${transferNote.trim()}`;
    try {
      setSubmitting(true);
      await ordersApi.updateStatus(order.id, {
        status: 'processing',
        note: fullNote,
      });
      toast.success(`Đã bàn giao đơn #${shortCode} cho ${vendor.name} (SLA ${slaHours}h)!`);
      await onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(`Lỗi chuyển đơn cho Vendor: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveExceptionSubmit = async (e) => {
    e.preventDefault();
    const note = `[Xử lý sự cố trong thẩm quyền] Loại: ${resolveType}. Kết quả: ${resolveNote.trim()}`;
    try {
      setSubmitting(true);
      await ordersApi.updateStatus(order.id, {
        status: order.status,
        note,
        notifyTarget: 'vendor',
        title: `[Xử lý sự cố] Đơn hàng #${order.orderCode || order.id.slice(0, 8)}`,
      });
      toast.success('Đã cập nhật xử lý sự cố & gửi thông báo đến Vendor đối tác!');
      await onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(`Lỗi cập nhật sự cố: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEscalateExceptionSubmit = async (e) => {
    e.preventDefault();
    const note = `[Chuyển tiếp Admin xử lý] Ưu tiên: ${escalatePriority}. Lý do: ${escalateReason}. Nội dung: ${escalateNote.trim()}`;
    try {
      setSubmitting(true);
      await ordersApi.updateStatus(order.id, {
        status: order.status,
        note,
        notifyTarget: 'admin',
        title: `[Báo cáo sự cố] Đơn hàng #${order.orderCode || order.id.slice(0, 8)}`,
      });
      toast.success('Đã chuyển tiếp báo cáo sự cố đến Ban Quản Trị (Admin)!');
      await onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(`Lỗi chuyển tiếp sự cố: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#131B17] rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 ${meta.headerClass}`}
        >
          <div className={`flex items-center space-x-2 ${meta.iconClass}`}>
            <HeaderIcon className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{meta.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {mode === 'confirm' && (
            <form onSubmit={handleConfirmSubmit} className="p-6 space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-200">
                <span className="font-bold">Mã đơn:</span>{' '}
                <span className="font-mono font-semibold" title={order.orderCode}>
                  #{shortCode}
                </span>
                <div className="mt-1">
                  Khách hàng: <span className="font-medium">{order.receiverName}</span> -{' '}
                  {order.receiverPhone}
                </div>
                <div>
                  Tổng tiền:{' '}
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {order.totalAmount?.toLocaleString()} đ
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Danh mục kiểm tra trước khi xác nhận:
                </label>
                <label className="flex items-center space-x-2.5 text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isStockChecked}
                    onChange={(e) => setIsStockChecked(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded border-slate-300 dark:border-slate-600 focus:ring-emerald-500"
                  />
                  <span>Tồn kho sản phẩm còn đủ và trạng thái hàng hóa nguyên vẹn</span>
                </label>
                <label className="flex items-center space-x-2.5 text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCustomerChecked}
                    onChange={(e) => setIsCustomerChecked(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded border-slate-300 dark:border-slate-600 focus:ring-emerald-500"
                  />
                  <span>Thông tin địa chỉ người nhận rõ ràng và đã kiểm chứng</span>
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ghi chú xác nhận của nhân viên (Lưu vào lịch sử):
                </label>
                <textarea
                  rows={3}
                  value={confirmNote}
                  onChange={(e) => setConfirmNote(e.target.value)}
                  required
                  placeholder="Nhập ghi chú chi tiết..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Đang xác nhận...' : 'Xác nhận đơn ngay'}</span>
                </button>
              </div>
            </form>
          )}

          {mode === 'reject' &&
            (order.status !== 'pending' ? (
              <div className="p-6 space-y-4">
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 flex items-start space-x-3 text-amber-800 dark:text-amber-200 text-xs">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Hạn chế quyền hạn:</p>
                    <p className="mt-1">
                      Đơn hàng này hiện đang ở trạng thái{' '}
                      <span className="font-bold uppercase font-mono">{order.status}</span>. Quy
                      định của MIVA chỉ cho phép nhân viên từ chối trực tiếp đối với các đơn hàng
                      chưa xác nhận (<span className="font-bold">Chờ xác nhận</span>).
                    </p>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                      Đối với đơn đã xác nhận hoặc đang xử lý, vui lòng dùng tính năng{' '}
                      <span className="font-semibold text-rose-700 dark:text-rose-400">
                        Xử lý sự cố / Chuyển tiếp Admin
                      </span>{' '}
                      để đề xuất hủy.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
                  >
                    Đã hiểu và Đóng lại
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
                <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl p-3 text-xs text-rose-900 dark:text-rose-200">
                  <p>
                    <span className="font-bold">Mã đơn hàng:</span>{' '}
                    <span className="font-mono font-bold" title={order.orderCode}>
                      #{shortCode}
                    </span>
                  </p>
                  <p className="mt-0.5">
                    Khách hàng: {order.receiverName} - {order.receiverPhone}
                  </p>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-1">
                    Lưu ý: Thao tác này sẽ hủy đơn và hoàn lại tồn kho cho hệ thống. Thao tác được
                    ghi vết kiểm toán vĩnh viễn.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Chọn quy tắc từ chối áp dụng: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedRule}
                    onChange={(e) => setSelectedRule(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {REJECTION_RULES.map((rule) => (
                      <option key={rule.code} value={rule.code}>
                        {rule.code} - {rule.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                    {REJECTION_RULES.find((r) => r.code === selectedRule)?.description}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Mô tả chi tiết bằng chứng / lý do (Bắt buộc):{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    required
                    placeholder="Ví dụ: Đã gọi khách lúc 10h15 và 11h00 không nghe máy, số điện thoại báo tạm khóa..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <label className="flex items-start space-x-2.5 text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedRejectCheck}
                    onChange={(e) => setConfirmedRejectCheck(e.target.checked)}
                    className="w-4 h-4 accent-rose-600 rounded border-slate-300 dark:border-slate-600 focus:ring-rose-500 mt-0.5"
                  />
                  <span>
                    Tôi xác nhận đã kiểm tra đúng quy định vận hành và chịu trách nhiệm về quyết
                    định từ chối đơn hàng này.
                  </span>
                </label>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition disabled:opacity-50"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <AlertOctagon className="w-4 h-4" />
                    )}
                    <span>{submitting ? 'Đang xử lý...' : 'Xác nhận từ chối đơn'}</span>
                  </button>
                </div>
              </form>
            ))}

          {mode === 'transfer' && (
            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
              <div className="bg-[#EEF5F1] dark:bg-[#1A3A2C]/35 border border-[#B9D6C6] dark:border-[#2A5C4A]/60 rounded-xl p-3 text-xs text-[#1A3A2C] dark:text-[#D5E6DD]">
                <p>
                  <span className="font-bold">Đơn hàng:</span>{' '}
                  <span
                    className="font-mono font-bold text-[#1A3A2C] dark:text-[#DEC47E]"
                    title={order.orderCode}
                  >
                    #{shortCode}
                  </span>
                </p>
                <p className="mt-0.5">
                  Sản phẩm: {order.details?.length || 1} mặt hàng - Tổng tiền:{' '}
                  {order.totalAmount?.toLocaleString()} đ
                </p>
                <p className="text-[11px] text-[#2A5C4A] dark:text-[#A3B8AE] mt-1">
                  Sau khi chuyển, đơn sẽ sang trạng thái{' '}
                  <span className="font-semibold">Đang đóng gói</span> và Vendor sở hữu sản phẩm sẽ
                  nhận được thông báo để xuất kho đóng gói.
                </p>
              </div>

              {orderVendors.length <= 1 ? (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Ràng buộc quyền hạn điều phối:</p>
                    <p className="text-emerald-800 dark:text-emerald-300 mt-0.5 leading-relaxed">
                      Khách hàng đặt mua sản phẩm của gian hàng{' '}
                      <span className="font-bold underline">
                        {orderVendors[0]?.name || 'Đối tác chính thức'}
                      </span>
                      . Theo quy định hệ thống, nhân viên chỉ chuyển đơn cho đúng Vendor này để
                      chuẩn bị hàng.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">
                      Đơn hàng chứa sản phẩm từ {orderVendors.length} gian hàng:
                    </p>
                    <p className="text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                      Vui lòng chọn gian hàng đối tác phụ trách để bàn giao đợt xuất kho tương ứng.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Nhà Cung Cấp / Đối Tác Phụ Trách:{' '}
                  <span className="text-[#2A5C4A] dark:text-[#DEC47E]">*</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {orderVendors.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                      Không tìm thấy thông tin Vendor từ sản phẩm trong đơn.
                    </div>
                  ) : (
                    orderVendors.map((vendor) => {
                      const isSelected = selectedVendorId === vendor.id;
                      const vendorProducts = (order.details || []).filter(
                        (d) => d.vendorId === vendor.id,
                      );
                      return (
                        <div
                          key={vendor.id}
                          onClick={() => {
                            setSelectedVendorId(vendor.id);
                            if (vendor.slaHours) setSlaHours(vendor.slaHours);
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                            isSelected
                              ? 'border-[#2A5C4A] dark:border-[#C9A84C] bg-[#EEF5F1]/70 dark:bg-[#1A3A2C]/40 ring-1 ring-[#2A5C4A] dark:ring-[#C9A84C]'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${
                                isSelected
                                  ? 'bg-[#1A3A2C] dark:bg-[#2A5C4A] text-[#DEC47E]'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <Store className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-800 dark:text-white">
                                  {vendor.name}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FBF7EC] dark:bg-[#C9A84C]/15 text-[#8C6B1F] dark:text-[#DEC47E] font-semibold">
                                  {vendor.code}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {vendor.region} • Hotline: {vendor.phone}
                              </p>
                              {vendorProducts.length > 0 && (
                                <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                  <Package className="w-3 h-3 text-slate-400" />
                                  {vendorProducts.length} sản phẩm thuộc gian hàng này
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-500/15 px-2 py-0.5 rounded-full">
                              Vendor chính thức
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Thời hạn cam kết xử lý (SLA đóng gói):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[8, 12, 24, 36].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setSlaHours(hours)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                        slaHours === hours
                          ? 'border-[#1A3A2C] dark:border-[#C9A84C] bg-[#EEF5F1] dark:bg-[#1A3A2C]/50 text-[#1A3A2C] dark:text-[#DEC47E]'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {hours} Giờ
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ghi chú chỉ dẫn cho Vendor:
                </label>
                <textarea
                  rows={2}
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="Nhập yêu cầu kiểm tra hoặc đóng gói..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2A5C4A]/25 focus:border-[#2A5C4A]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting || orderVendors.length === 0}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#2A5C4A] dark:hover:bg-[#35755B] disabled:bg-slate-300 dark:disabled:bg-slate-700 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-[#DEC47E]" />
                  )}
                  <span>{submitting ? 'Đang bàn giao...' : 'Chuyển đơn cho Vendor'}</span>
                </button>
              </div>
            </form>
          )}

          {mode === 'exception' && (
            <>
              <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-1">
                <button
                  type="button"
                  onClick={() => setExceptionTab('resolve')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                    exceptionTab === 'resolve'
                      ? 'bg-white dark:bg-[#131B17] text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Xử lý trong thẩm quyền</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExceptionTab('escalate')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                    exceptionTab === 'escalate'
                      ? 'bg-white dark:bg-[#131B17] text-rose-700 dark:text-rose-400 shadow-xs border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Chuyển tiếp Admin xử lý</span>
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs">
                  <p className="font-semibold text-slate-800 dark:text-white">
                    Đơn hàng:{' '}
                    <span
                      className="font-mono text-[#1A3A2C] dark:text-[#DEC47E] font-bold"
                      title={order.orderCode}
                    >
                      #{shortCode}
                    </span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                    Khách hàng: {order.receiverName} • {order.receiverPhone}
                  </p>
                  {order.exception && (
                    <div className="mt-2 p-2 bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/35 rounded-lg text-[11px] text-rose-800 dark:text-rose-200">
                      <span className="font-bold">Sự cố đang ghi nhận:</span>{' '}
                      {order.exception.title} ({order.exception.suggestedAction})
                    </div>
                  )}
                </div>

                {exceptionTab === 'resolve' ? (
                  <form onSubmit={handleResolveExceptionSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Biện pháp khắc phục trong phạm vi nhân viên:
                      </label>
                      <select
                        value={resolveType}
                        onChange={(e) => setResolveType(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="URGE_VENDOR">
                          Đốc thúc Vendor ưu tiên đóng gói và xuất hàng ngay
                        </option>
                        <option value="EXTEND_SLA">
                          Gia hạn thêm SLA đóng gói 12 giờ theo thỏa thuận
                        </option>
                        <option value="CONTACTED_CUSTOMER">
                          Đã liên hệ khách và xác nhận chờ hàng tiếp
                        </option>
                        <option value="CORRECT_ADDRESS">
                          Cập nhật lại số điện thoại / địa chỉ mới theo khách
                        </option>
                        <option value="REALLOCATE_VENDOR">
                          Điều phối lại đơn hàng cho Vendor khác
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Chi tiết kết quả xử lý (Ghi vào lịch sử đơn):
                      </label>
                      <textarea
                        rows={3}
                        value={resolveNote}
                        onChange={(e) => setResolveNote(e.target.value)}
                        required
                        placeholder="Ví dụ: Đã gọi điện quản lý kho xác nhận sẽ xuất kiện hàng trước 16h chiều nay..."
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition disabled:opacity-50"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>{submitting ? 'Đang lưu...' : 'Hoàn tất xử lý'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleEscalateExceptionSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Lý do cần chuyển tiếp cấp trên (Admin):
                      </label>
                      <select
                        value={escalateReason}
                        onChange={(e) => setEscalateReason(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="REFUND_OVER_LIMIT">
                          Yêu cầu hoàn tiền vượt quá hạn mức nhân viên cho phép
                        </option>
                        <option value="COMPLEX_DISPUTE">
                          Tranh chấp gay gắt giữa Vendor và Khách hàng
                        </option>
                        <option value="VENDOR_POLICY_BREACH">
                          Vendor vi phạm quy chế nghiêm trọng (từ chối giao, tráo hàng)
                        </option>
                        <option value="SUSPECTED_SYSTEM_FRAUD">
                          Nghi vấn gian lận bảo mật hoặc lỗi voucher nghiêm trọng
                        </option>
                        <option value="COMPENSATION_REQUEST">
                          Khách yêu cầu bồi thường thiệt hại đặc biệt
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Mức độ ưu tiên xử lý:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'normal', label: 'Bình thường' },
                          { val: 'high', label: 'Ưu tiên cao' },
                          { val: 'urgent', label: 'Khẩn cấp (SLA 2h)' },
                        ].map((p) => (
                          <button
                            key={p.val}
                            type="button"
                            onClick={() => setEscalatePriority(p.val)}
                            className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                              escalatePriority === p.val
                                ? 'border-rose-600 bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Báo cáo tóm tắt gửi Admin:
                      </label>
                      <textarea
                        rows={3}
                        value={escalateNote}
                        onChange={(e) => setEscalateNote(e.target.value)}
                        required
                        placeholder="Trình bày ngắn gọn bối cảnh và đề xuất phương án để Admin phê duyệt..."
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition disabled:opacity-50"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                        <span>{submitting ? 'Đang chuyển tiếp...' : 'Gửi chuyển tiếp Admin'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const OrderActionModal = ({ order, mode = 'confirm', isOpen, onClose, onSuccess }) => {
  if (!isOpen || !order || !mode) return null;
  return (
    <OrderActionModalBody
      key={`${mode}-${order.id}`}
      order={order}
      mode={mode}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};

export default OrderActionModal;
