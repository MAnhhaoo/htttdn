import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

/**
 * Thanh phân trang gọn chuẩn dùng chung cho mọi bảng dữ liệu (Admin / Vendor / Employee).
 */
export function PaginationFooter({
  page = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  itemLabel = 'bản ghi',
  className = '',
}) {
  if (totalPages <= 1 && totalItems === 0) return null;

  return (
    <div
      className={`px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 ${className}`}
    >
      <span>
        Tổng cộng <strong className="text-slate-800 dark:text-slate-200">{totalItems}</strong>{' '}
        {itemLabel} &bull; Trang{' '}
        <strong className="text-slate-800 dark:text-slate-200">{page}</strong> /{' '}
        {Math.max(1, totalPages)}
      </span>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange?.(Math.max(1, page - 1))}
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Trước
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
        >
          Sau <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export default PaginationFooter;

