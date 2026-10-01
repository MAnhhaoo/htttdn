import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push('…');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('…');
    }

    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
      <p className="text-sm text-light-muted dark:text-dark-muted order-2 sm:order-1">
        Hiển thị <span className="font-semibold text-light-text dark:text-dark-text">{startItem}–{endItem}</span> trong{' '}
        <span className="font-semibold text-light-text dark:text-dark-text">{totalItems}</span> sản phẩm
      </p>

      <nav className="flex items-center gap-1 order-1 sm:order-2" aria-label="Pagination">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-primary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-light-muted disabled:hover:border-light-border transition-colors bg-white dark:bg-dark-card"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '…') {
              return (
                <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-sm text-light-muted dark:text-dark-muted">
                  …
                </span>
              );
            }
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'text-light-text dark:text-dark-text hover:bg-light-surface dark:hover:bg-dark-surface border border-transparent hover:border-light-border dark:hover:border-dark-border'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-primary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-light-muted disabled:hover:border-light-border transition-colors bg-white dark:bg-dark-card"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}
