import React, { useState } from 'react';
import { REJECTION_RULES } from '../../constants/rules';
import { AlertOctagon, X, AlertTriangle } from 'lucide-react';

export const RejectOrderModal = ({ order, isOpen, onClose, onReject }) => {
  const [selectedRule, setSelectedRule] = useState(REJECTION_RULES[0].code);
  const [note, setNote] = useState('');
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  if (!isOpen || !order) return null;

  // Strict rule enforcement: Only pending orders can be rejected by employee
  const isPending = order.status === 'pending';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isPending) {
      alert('Chỉ được phép từ chối đơn hàng đang ở trạng thái Chờ xác nhận (Pending)!');
      return;
    }
    if (!confirmedCheck) {
      alert('Vui lòng đánh dấu xác nhận việc áp dụng quy tắc từ chối!');
      return;
    }

    const ruleObj = REJECTION_RULES.find((r) => r.code === selectedRule);
    const formattedNote = `[Quy tắc: ${ruleObj?.title}] ${note.trim()}`;
    onReject(order.id, formattedNote, selectedRule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center space-x-2 text-rose-600">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-base">Từ Chối Đơn Chưa Xác Nhận Theo Quy Tắc</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isPending ? (
          <div className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-amber-800 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Hạn chế quyền hạn:</p>
                <p className="mt-1">
                  Đơn hàng này hiện đang ở trạng thái <span className="font-bold uppercase font-mono">{order.status}</span>.
                  Quy định của Miva chỉ cho phép nhân viên từ chối trực tiếp đối với các đơn hàng chưa xác nhận (<span className="font-bold">pending</span>).
                </p>
                <p className="mt-2 text-slate-600">
                  Đối với đơn đã xác nhận hoặc đang xử lý, vui lòng dùng tính năng <span className="font-semibold text-rose-700">Xử lý sự cố / Chuyển tiếp Admin</span> để đề xuất hủy.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Đã hiểu và Đóng lại
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900">
              <p>
                <span className="font-bold">Mã đơn hàng:</span> <span className="font-mono font-bold">{order.orderCode}</span>
              </p>
              <p className="mt-0.5">Khách hàng: {order.receiverName} - {order.receiverPhone}</p>
              <p className="text-[11px] text-rose-700 mt-1">
                Lưu ý: Thao tác này sẽ hủy đơn và hoàn lại tồn kho cho hệ thống. Thao tác được ghi vết kiểm toán vĩnh viễn.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Chọn quy tắc từ chối áp dụng: <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedRule}
                onChange={(e) => setSelectedRule(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
              >
                {REJECTION_RULES.map((rule) => (
                  <option key={rule.code} value={rule.code}>
                    {rule.code} - {rule.title}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1 italic">
                {REJECTION_RULES.find((r) => r.code === selectedRule)?.description}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Mô tả chi tiết bằng chứng / lý do (Bắt buộc): <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                placeholder="Ví dụ: Đã gọi khách lúc 10h15 và 11h00 không nghe máy, số điện thoại báo tạm khóa..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <label className="flex items-start space-x-2.5 text-xs text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedCheck}
                onChange={(e) => setConfirmedCheck(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 mt-0.5"
              />
              <span>
                Tôi xác nhận đã kiểm tra đúng quy định vận hành và chịu trách nhiệm về quyết định từ chối đơn hàng này.
              </span>
            </label>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Quay lại
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition flex items-center space-x-1.5"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Xác nhận từ chối đơn</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
