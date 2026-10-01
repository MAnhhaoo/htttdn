import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronRight, RotateCcw, Search, Loader2 } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import ProductCardSkeleton from '../../components/product/ProductCard/ProductCardSkeleton';
import Pagination from '../../components/common/Pagination/Pagination';

const ITEMS_PER_PAGE = 12;

export default function ProductSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const productGridRef = useRef(null);

  // Read URL params
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const createdAfter = searchParams.get('createdAfter') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { products, isLoading, isFetching, meta } = useProducts({
    q,
    category,
    createdAfter,
    page,
    limit: ITEMS_PER_PAGE,
  });

  // Fetch all categories for filter sidebar
  const { categories, isLoading: isLoadingCategories } = useCategories({ itemPerPage: 100 });

  // Get the active category name
  const activeCategoryName = category
    ? categories.find(c => c.slug === category)?.name || category
    : '';

  // ── Handlers ──
  const updateParams = useCallback((updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset to page 1 when filters change (unless the update is a page change itself)
    if (!('page' in updates)) {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleCategoryChange = (slug) => {
    updateParams({ category: slug || '' });
    setMobileFilterOpen(false);
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage > 1 ? String(newPage) : '' });
    // Scroll to product grid
    setTimeout(() => {
      productGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleResetFilters = () => {
    setSearchParams({});
    setMobileFilterOpen(false);
  };

  const hasActiveFilters = q || category;

  // Lock body scroll when mobile filter is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileFilterOpen]);

  // ── Filter Sidebar Content (shared desktop/mobile) ──
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Section: Categories */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-widest text-light-muted dark:text-dark-muted mb-3 font-sans">
          Danh mục
        </h4>
        <div className="space-y-1">
          <label className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-light-surface dark:hover:bg-dark-surface transition-colors">
            <input
              type="radio"
              name="category"
              checked={!category}
              onChange={() => handleCategoryChange('')}
              className="w-4 h-4 text-primary accent-primary"
            />
            <span className={`text-sm ${!category ? 'font-semibold text-primary' : 'text-light-text dark:text-dark-text'}`}>
              Tất cả danh mục
            </span>
          </label>
          {isLoadingCategories ? (
            <div className="space-y-2 px-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-light-surface dark:bg-dark-surface rounded animate-pulse" />
              ))}
            </div>
          ) : (
            categories.map(cat => (
              <label key={cat.id} className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-light-surface dark:hover:bg-dark-surface transition-colors">
                <input
                  type="radio"
                  name="category"
                  checked={category === cat.slug}
                  onChange={() => handleCategoryChange(cat.slug)}
                  className="w-4 h-4 text-primary accent-primary"
                />
                <span className={`text-sm ${category === cat.slug ? 'font-semibold text-primary' : 'text-light-text dark:text-dark-text'}`}>
                  {cat.name}
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-light-border dark:bg-dark-border" />

      {/* Info: Sorting */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-widest text-light-muted dark:text-dark-muted mb-2 font-sans">
          Sắp xếp
        </h4>
        <p className="text-sm text-light-muted dark:text-dark-muted">
          Mới nhất trước
        </p>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <>
          <div className="h-px bg-light-border dark:bg-dark-border" />
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors w-full"
          >
            <RotateCcw className="w-4 h-4" />
            Xóa bộ lọc
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1.5 text-sm text-light-muted dark:text-dark-muted mb-6 overflow-x-auto">
          <Link to="/" className="hover:text-primary transition-colors whitespace-nowrap">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          {category ? (
            <>
              <Link to="/products" className="hover:text-primary transition-colors whitespace-nowrap">Sản phẩm</Link>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <span className="text-light-text dark:text-dark-text font-medium truncate">{activeCategoryName}</span>
            </>
          ) : (
            <span className="text-light-text dark:text-dark-text font-medium">Sản phẩm</span>
          )}
        </nav>

        {/* ── Page Header ── */}
        <div ref={productGridRef} className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">
              {q ? `Kết quả cho "${q}"` : activeCategoryName || 'Tất cả sản phẩm'}
            </h1>
            <p className="text-sm text-light-muted dark:text-dark-muted mt-1">
              {isLoading ? (
                'Đang tải...'
              ) : (
                <>Hiển thị {products.length} / {meta.totalItems} sản phẩm</>
              )}
            </p>
          </div>

          {/* Mobile filter button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 card-surface rounded-xl text-sm font-medium text-light-text dark:text-dark-text hover:border-primary transition-colors self-start"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Bộ lọc
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </div>

        {/* ── Main Layout ── */}
        <div className="flex gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 card-surface rounded-2xl p-5">
              <h3 className="text-sm font-bold uppercase tracking-widest text-light-text dark:text-dark-text mb-4 font-sans flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                Bộ lọc
              </h3>
              <FilterContent />
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 min-w-0">
            {/* Loading overlay for page transitions */}
            <div className={`relative ${isFetching && !isLoading ? 'opacity-60' : ''} transition-opacity`}>
              {isFetching && !isLoading && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white dark:bg-dark-card px-4 py-2 rounded-full shadow-lg border border-light-border dark:border-dark-border flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-light-muted dark:text-dark-muted">Đang tải...</span>
                </div>
              )}

              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {isLoading ? (
                  [...Array(ITEMS_PER_PAGE)].map((_, i) => <ProductCardSkeleton key={i} />)
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center card-surface rounded-2xl border-dashed">
                    <Search className="w-12 h-12 text-light-muted dark:text-dark-muted mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium text-light-text dark:text-dark-text mb-2">
                      Không tìm thấy sản phẩm
                    </p>
                    <p className="text-sm text-light-muted dark:text-dark-muted mb-4">
                      Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="text-primary font-semibold hover:underline"
                    >
                      Xóa tất cả bộ lọc
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {!isLoading && meta.totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={meta.totalPages}
                totalItems={meta.totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-dark-card shadow-2xl flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-5 border-b border-light-border dark:border-dark-border">
              <h2 className="text-lg font-bold text-light-text dark:text-dark-text font-sans">Bộ lọc</h2>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 text-light-muted hover:text-light-text dark:text-dark-muted dark:hover:text-dark-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterContent />
            </div>
          </div>
        </div>
      )}

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
