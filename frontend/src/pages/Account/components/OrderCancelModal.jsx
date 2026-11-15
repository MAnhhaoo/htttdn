import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { orderService } from '../../../services/orderService';
import { useToast } from '../../../components/common/Toast/Toast';

const CANCEL_REASONS = [
  'Thay đổi nhu cầu mua sắm',
  'Muốn cập nhật lại địa chỉ nhận hàng',
  'Muốn thay đổi sản phẩm / màu sắc / kích thước khác',
  'Tìm thấy giá tốt hơn ở nơi khác',
  'Thời gian giao hàng dự kiến quá lâu',
  'Lý do khác',
];

export default function OrderCancelModal({ cancelTarget, onClose, onCancelled }) {
  const toast = useToast();
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cancelTarget) {
      setSelectedReason(CANCEL_REASONS[0]);
      setCustomReason('');
      setError('');
    }
  }, [cancelTarget]);

  if (!cancelTarget) return null;

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    let finalReason = selectedReason;
    if (selectedReason === 'Lý do khác') {
      if (!customReason.trim()) {
        setError('Vui lòng nhập nội dung lý do bạn muốn hủy đơn hàng');
        return;
      }
      finalReason = customReason.trim();
    }

    try {
      setLoading(true);
      setError('');

      if (cancelTarget.type === 'batch' && Array.isArray(cancelTarget.subOrders)) {
        const pendingSubOrders = cancelTarget.subOrders.filter((so) => so.status === 'pending');
        await Promise.all(
          pendingSubOrders.map((so) => orderService.cancelOrder(so.id, finalReason)),
        );
        toast.success(`Đã hủy toàn bộ ${pendingSubOrders.length} đơn hàng thành công!`);
      } else {
        await orderService.cancelOrder(cancelTarget.id, finalReason);
        toast.success('Đã hủy đơn hàng thành công!');
      }

      await onCancelled?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi hủy đơn hàng';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-dark-card rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-light-border dark:border-dark-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
          <h3 className="font-bold text-base text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            {cancelTarget.type === 'batch'
              ? `Hủy toàn bộ đơn gộp #${cancelTarget.code}`
              : `Hủy đơn hàng #${cancelTarget.code}`}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="text-light-muted hover:text-light-text dark:hover:text-dark-text p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-light-text dark:text-dark-text mb-2.5">
              Vui lòng chọn lý do hủy đơn hàng của bạn:
            </p>
            <div className="space-y-2">
              {CANCEL_REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs transition ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary font-semibold dark:bg-primary/10'
                        : 'border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={isSelected}
                      onChange={() => setSelectedReason(reason)}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <span>{reason}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {selectedReason === 'Lý do khác' && (
            <div>
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text mb-1">
                Nhập chi tiết lý do khác của bạn <span className="text-rose-500">*</span>:
              </label>
              <textarea
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                required
                placeholder="Vui lòng cho MIVA biết thêm thông tin để cải thiện dịch vụ..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          )}

          <div className="p-3 bg-light-bg dark:bg-dark-bg/60 rounded-xl text-[11px] text-light-muted dark:text-dark-muted border border-light-border/60 dark:border-dark-border/60">
            Lưu ý: Sau khi xác nhận hủy, các voucher đã dùng sẽ được hoàn lại (nếu còn hạn) và đơn hàng không thể khôi phục lại trạng thái ban đầu.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-light-border dark:border-dark-border">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-xs text-light-muted hover:text-light-text dark:hover:text-dark-text rounded-xl font-semibold transition cursor-pointer"
            >
              Quay lại
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-xs transition disabled:opacity-60 cursor-pointer"
            >
              {loading
                ? 'Đang xử lý hủy...'
                : cancelTarget.type === 'batch'
                  ? `Xác nhận hủy cả ${cancelTarget.subOrders?.length || 2} đơn hàng`
                  : 'Xác nhận hủy đơn hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
