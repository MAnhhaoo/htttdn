import React, { useState } from 'react';
import { AlertTriangle, ArrowUpRight, CheckCircle2, X, ShieldAlert } from 'lucide-react';

export const ExceptionModal = ({ order, isOpen, onClose, onResolve, onEscalate }) => {
  const [activeTab, setActiveTab] = useState('resolve'); // 'resolve' | 'escalate'
  const [resolveType, setResolveType] = useState('URGE_VENDOR');
  const [resolveNote, setResolveNote] = useState('');
  
  const [escalateReason, setEscalateReason] = useState('REFUND_OVER_LIMIT');
  const [escalatePriority, setEscalatePriority] = useState('high');
  const [escalateNote, setEscalateNote] = useState('');

  if (!isOpen || !order) return null;

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    onResolve(order.id, {
      type: resolveType,
      note: resolveNote,
      resolvedAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleEscalateSubmit = (e) => {
    e.preventDefault();
    onEscalate(order.id, {
      reason: escalateReason,
      priority: escalatePriority,
      note: escalateNote,
      escalatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center space-x-2 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-base">Xử Lý & Chuyển Tiếp Sự Cố Đơn Hàng</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('resolve')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'resolve'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Xử lý trong thẩm quyền</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('escalate')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'escalate'
                ? 'bg-white text-rose-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Chuyển tiếp Admin xử lý</span>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
            <p className="font-semibold text-slate-800">
              Đơn hàng: <span className="font-mono text-blue-700 font-bold">{order.orderCode}</span>
            </p>
            <p className="text-slate-600 mt-0.5">Khách hàng: {order.receiverName} • {order.receiverPhone}</p>
            {order.exception && (
              <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800">
                <span className="font-bold">Sự cố đang ghi nhận:</span> {order.exception.title} ({order.exception.suggestedAction})
              </div>
            )}
          </div>

          {activeTab === 'resolve' ? (
            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Biện pháp khắc phục trong phạm vi nhân viên:
                </label>
                <select
                  value={resolveType}
                  onChange={(e) => setResolveType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                >
                  <option value="URGE_VENDOR">Đốc thúc Vendor ưu tiên đóng gói và xuất hàng ngay</option>
                  <option value="EXTEND_SLA">Gia hạn thêm SLA đóng gói 12 giờ theo thỏa thuận</option>
                  <option value="CONTACTED_CUSTOMER">Đã liên hệ khách và xác nhận chờ hàng tiếp</option>
                  <option value="CORRECT_ADDRESS">Cập nhật lại số điện thoại / địa chỉ mới theo khách</option>
                  <option value="REALLOCATE_VENDOR">Điều phối lại đơn hàng cho Vendor khác</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Chi tiết kết quả xử lý (Ghi vào lịch sử đơn):
                </label>
                <textarea
                  rows={3}
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  required
                  placeholder="Ví dụ: Đã gọi điện quản lý kho VND-01 xác nhận sẽ xuất kiện hàng trước 16h chiều nay..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hoàn tất xử lý</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleEscalateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Lý do cần chuyển tiếp cấp trên (Admin):
                </label>
                <select
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                >
                  <option value="REFUND_OVER_LIMIT">Yêu cầu hoàn tiền vượt quá hạn mức nhân viên cho phép</option>
                  <option value="COMPLEX_DISPUTE">Tranh chấp gay gắt giữa Vendor và Khách hàng</option>
                  <option value="VENDOR_POLICY_BREACH">Vendor vi phạm quy chế nghiêm trọng (từ chối giao, tráo hàng)</option>
                  <option value="SUSPECTED_SYSTEM_FRAUD">Nghi vấn gian lận bảo mật hoặc lỗi voucher nghiêm trọng</option>
                  <option value="COMPENSATION_REQUEST">Khách yêu cầu bồi thường thiệt hại đặc biệt</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
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
                      className={`py-2 text-xs font-bold rounded-lg border transition ${
                        escalatePriority === p.val
                          ? 'border-rose-600 bg-rose-50 text-rose-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Báo cáo tóm tắt gửi Admin:
                </label>
                <textarea
                  rows={3}
                  value={escalateNote}
                  onChange={(e) => setEscalateNote(e.target.value)}
                  required
                  placeholder="Trình bày ngắn gọn bối cảnh và đề xuất phương án để Admin phê duyệt..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition flex items-center space-x-1.5"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Gửi chuyển tiếp Admin</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
