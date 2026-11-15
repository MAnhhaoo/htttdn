import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { addDaysToDateInput, formatDate } from '../../utils/formatHelpers';

/**
 * Modal gia hạn thời hạn kết thúc dùng chung cho Voucher & Khảo sát (Admin / Vendor).
 */
export function ExtendEndDateModal({
  isOpen,
  onClose,
  title = 'Gia hạn thời gian áp dụng',
  itemTitle = '',
  itemCode = '',
  currentEndDate,
  onConfirm,
}) {
  const [newEndDate, setNewEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewEndDate(addDaysToDateInput(14));
      setError('');
    }
  }, [isOpen, currentEndDate]);

  const handleConfirm = async () => {
    if (!newEndDate || submitting) return;
    setError('');
    try {
      setSubmitting(true);
      const isoEnd = new Date(`${newEndDate}T23:59:59.999`).toISOString();
      await onConfirm(isoEnd);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Gia hạn thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !submitting && onClose()} title={title} maxWidth="max-w-md">
      <div className="space-y-4 text-sm">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
          {itemTitle && (
            <div>
              Chương trình: <strong>{itemTitle}</strong>
            </div>
          )}
          {itemCode && (
            <div>
              Mã định danh: <code className="font-bold text-amber-600 font-mono">{itemCode}</code>
            </div>
          )}
          <div>
            Thời hạn kết thúc hiện tại:{' '}
            <span className="text-slate-500 font-semibold">
              {currentEndDate ? formatDate(currentEndDate) : 'Chưa giới hạn'}
            </span>
          </div>
        </div>

        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Chọn nhanh thời hạn gia hạn:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[7, 14, 30, 60].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setNewEndDate(addDaysToDateInput(days))}
                className="py-1.5 px-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#2A5C4A] hover:bg-[#EEF5F1]/70 dark:hover:bg-[#1A3A2C]/35 text-slate-700 dark:text-slate-200 transition-colors"
              >
                +{days} ngày
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Ngày kết thúc mới:
          </label>
          <input
            type="date"
            min={addDaysToDateInput(1)}
            value={newEndDate}
            onChange={(e) => setNewEndDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A5C4A]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!newEndDate || submitting}>
            {submitting ? 'Đang gia hạn...' : 'Xác nhận gia hạn'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ExtendEndDateModal;

