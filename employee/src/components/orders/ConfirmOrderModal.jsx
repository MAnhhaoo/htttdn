import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export const ConfirmOrderModal = ({ order, isOpen, onClose, onConfirm }) => {
  const [note, setNote] = useState('Đã kiểm tra tồn kho và liên hệ khách hàng xác nhận hợp lệ.');
  const [isStockChecked, setIsStockChecked] = useState(true);
  const [isCustomerChecked, setIsCustomerChecked] = useState(true);

  if (!isOpen || !order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isStockChecked || !isCustomerChecked) {
      alert('Vui lòng hoàn tất danh sách kiểm tra trước khi xác nhận đơn!');
      return;
    }
    onConfirm(order.id, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-base">Xác Nhận Đơn Hàng</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800">
            <span className="font-bold">Mã đơn:</span> <span className="font-mono font-semibold">{order.orderCode}</span>
            <div className="mt-1">
              Khách hàng: <span className="font-medium">{order.receiverName}</span> - {order.receiverPhone}
            </div>
            <div>
              Tổng tiền: <span className="font-bold text-emerald-700">{order.totalAmount?.toLocaleString()} đ</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Danh mục kiểm tra trước khi xác nhận:</label>
            <label className="flex items-center space-x-2.5 text-xs text-slate-700 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isStockChecked}
                onChange={(e) => setIsStockChecked(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span>Tồn kho sản phẩm còn đủ và trạng thái hàng hóa nguyên vẹn</span>
            </label>
            <label className="flex items-center space-x-2.5 text-xs text-slate-700 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isCustomerChecked}
                onChange={(e) => setIsCustomerChecked(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span>Thông tin địa chỉ người nhận rõ ràng và đã kiểm chứng</span>
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Ghi chú xác nhận của nhân viên (Lưu vào lịch sử):
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
              placeholder="Nhập ghi chú chi tiết..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận đơn ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
