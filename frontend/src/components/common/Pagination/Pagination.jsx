export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-md border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-primary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ←
      </button>
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 flex items-center justify-center rounded-md border font-medium transition-colors ${
            currentPage === page 
              ? 'bg-primary border-primary text-white' 
              : 'border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-primary hover:border-primary'
          }`}
        >
          {page}
        </button>
      ))}

      <button 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-md border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-primary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        →
      </button>
    </div>
  );
}
