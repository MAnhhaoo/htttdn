import { useState, useEffect } from 'react';
import { Ban, AlertTriangle } from 'lucide-react';
import { Button, Modal } from '../../../components/ui';

const CANCEL_REASONS = [
  'Hết hàng tồn kho tại cửa hàng',
  'Sản phẩm bị lỗi hỏng khi kiểm tra',
  'Không kịp đóng gói trước thời hạn bàn giao',
  'Không liên hệ được bưu tá / Sự cố kho bãi',
  'Khác',
];

export default function CancelVendorOrderModal({
  vendorOrder,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) {
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelNote, setCancelNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCancelReason(CANCEL_REASONS[0]);
      setCancelNote('');
    }
  }, [isOpen, vendorOrder?.id]);

  if (!vendorOrder) return null;

  const handleConfirm = () => {
    const fullNote = `${cancelReason}${cancelNote.trim() ? `: ${cancelNote.trim()}` : ''}`;
    onConfirm(fullNote);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !loading && onClose()}
      title={`Hủy Kiện Hàng #${vendorOrder.vendorOrderCode}`}
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Quay lại
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <Ban className="w-4 h-4" />
            {loading ? 'Đang hủy...' : 'Xác nhận hủy kiện'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Khi hủy kiện hàng này, số lượng tồn kho của các sản phẩm bên trong sẽ được tự động cộng trả lại kho của shop.
          </span>
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Lý do hủy kiện hàng:
          </label>
          <select
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            disabled={loading}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {CANCEL_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason === 'Khác' ? 'Khác (nhập chi tiết bên dưới)' : reason}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Ghi chú bổ sung (tùy chọn):
          </label>
          <textarea
            rows={3}
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
            disabled={loading}
            placeholder="Nhập thông tin chi tiết giải trình cho Admin/Khách hàng..."
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>
    </Modal>
  );
}
