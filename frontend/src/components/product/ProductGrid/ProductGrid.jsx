import { Loader2, Package } from 'lucide-react';
import ProductCard from '../ProductCard/ProductCard';
import ProductCardSkeleton from '../ProductCard/ProductCardSkeleton';
import EmptyState from '../../common/EmptyState/EmptyState';
import Pagination from '../../common/Pagination/Pagination';

const COLUMN_CLASSES = {
  3: 'grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6',
  4: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6',
  5: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6',
};

export default function ProductGrid({
  products = [],
  isLoading = false,
  isFetching = false,
  skeletonCount = 8,
  columns = 4,
  gridClassName,
  emptyIcon = Package,
  emptyTitle = 'Không tìm thấy sản phẩm',
  emptyDescription = 'Hiện chưa có sản phẩm phù hợp với tiêu chí của bạn.',
  emptyActionText,
  onEmptyAction,
  pagination,
}) {
  const resolvedGridClass = gridClassName || COLUMN_CLASSES[columns] || COLUMN_CLASSES[4];
  const isTransitioning = isFetching && !isLoading;

  return (
    <div className="space-y-6">
      <div className={`relative transition-opacity duration-200 ${isTransitioning ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
        {isTransitioning && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white dark:bg-dark-card px-4 py-2 rounded-full shadow-lg border border-light-border dark:border-dark-border flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-light-muted dark:text-dark-muted">Đang tải...</span>
          </div>
        )}

        {isLoading ? (
          <div className={resolvedGridClass}>
            {Array.from({ length: skeletonCount }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={resolvedGridClass}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-10 card-surface rounded-2xl border border-dashed border-light-border dark:border-dark-border">
            <EmptyState
              icon={emptyIcon}
              title={emptyTitle}
              description={emptyDescription}
              actionText={emptyActionText}
              onAction={onEmptyAction}
            />
          </div>
        )}
      </div>

      {!isLoading && pagination && pagination.totalPages > 1 && (
        <div className="border-t border-light-border/70 dark:border-dark-border/70 pt-2">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}
