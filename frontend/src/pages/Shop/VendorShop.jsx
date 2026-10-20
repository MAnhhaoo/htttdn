import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Store, 
  Star, 
  Package, 
  Search, 
  ChevronRight, 
  ShieldCheck, 
} from 'lucide-react';
import { vendorService } from '../../services/vendorService';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import ProductCardSkeleton from '../../components/product/ProductCard/ProductCardSkeleton';
import Pagination from '../../components/common/Pagination/Pagination';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { useToast } from '../../components/common/Toast/Toast';

export default function VendorShop() {
  const { id } = useParams();
  const toast = useToast();
  const productsRef = useRef(null);

  const [vendor, setVendor] = useState(null);
  const [isLoadingVendor, setIsLoadingVendor] = useState(true);
  const [vendorError, setVendorError] = useState(null);

  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch vendor public profile
  useEffect(() => {
    let isMounted = true;
    setIsLoadingVendor(true);
    setVendorError(null);

    vendorService.getPublicProfile(id)
      .then((data) => {
        if (isMounted) {
          setVendor(data);
          setIsLoadingVendor(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error fetching vendor profile:', err);
          setVendorError('Không tìm thấy thông tin cửa hàng');
          setIsLoadingVendor(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Reset scroll on vendor change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Fetch products of this vendor
  const {
    products,
    meta,
    isLoading: isLoadingProducts,
    isFetching: isFetchingProducts,
  } = useProducts({
    vendorId: id,
    page,
    limit: 12,
    category: selectedCategory || undefined,
    search: debouncedSearch || undefined,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCategorySelect = (categorySlug) => {
    setSelectedCategory(categorySlug === selectedCategory ? '' : categorySlug);
    setPage(1);
  };

  if (isLoadingVendor) {
    return <Loading fullScreen text="Đang tải thông tin cửa hàng..." />;
  }

  if (vendorError || !vendor) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4 text-center">
        <EmptyState
          title="Không tìm thấy cửa hàng"
          description={vendorError || 'Người bán không tồn tại hoặc đã ngừng hoạt động.'}
          actionText="Quay lại danh sách sản phẩm"
          actionLink="/products"
        />
      </div>
    );
  }

  const storeName = vendor.storeName || vendor.fullName || 'Cửa hàng';
  const stats = vendor.stats || {};

  return (
    <div className="bg-[#FAF7F2] dark:bg-dark-bg min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-light-muted dark:text-dark-muted">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/products" className="hover:text-primary transition-colors">Sản phẩm</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-light-text dark:text-dark-text font-medium truncate max-w-[200px]">{storeName}</span>
        </nav>

        {/* ── Vendor Header Banner ── */}
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            {/* Left: Avatar + Name + Buttons */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-5 sm:gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-gray-100 dark:bg-dark-surface shadow-md flex items-center justify-center">
                  {vendor.avatarUrl ? (
                    <img 
                      src={vendor.avatarUrl} 
                      alt={storeName} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <Store className="w-10 h-10 text-primary" />
                  )}
                </div>
              </div>

              {/* Name & Actions */}
              <div className="text-center sm:text-left space-y-3">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-light-text dark:text-dark-text tracking-tight">
                    {storeName}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" /> Đối tác xác thực
                  </span>
                </div>

                <p className="text-xs text-light-muted dark:text-dark-muted flex items-center justify-center sm:justify-start gap-1.5">
                  Tham gia {stats.joinedText || 'gần đây'}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                  <a
                    href="#vendor-products-list"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark text-xs font-semibold transition-all shadow-sm shadow-primary/20"
                  >
                    <Package className="w-4 h-4" />
                    Xem sản phẩm
                  </a>
                </div>
              </div>
            </div>

            {/* Vertical Divider for large screens */}
            <div className="hidden lg:block w-[1px] h-20 bg-light-border dark:bg-dark-border" />

            {/* Right: Real Shop Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-y-4 gap-x-6 sm:gap-x-10 text-xs bg-light-surface/60 dark:bg-dark-surface/60 p-5 rounded-xl border border-light-border/70 dark:border-dark-border/70">
              <div>
                <span className="text-light-muted dark:text-dark-muted block mb-1">Đánh giá:</span>
                <span className="text-base font-bold text-amber-500 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-500" />
                  {stats.rating || 5.0}
                  <span className="text-xs font-normal text-light-muted dark:text-dark-muted">({stats.reviewCount || 0})</span>
                </span>
              </div>

              <div>
                <span className="text-light-muted dark:text-dark-muted block mb-1">Sản phẩm:</span>
                <span className="text-base font-bold text-primary">
                  {stats.totalProducts || 0}
                </span>
              </div>

              <div>
                <span className="text-light-muted dark:text-dark-muted block mb-1">Tỉ lệ phản hồi:</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.responseRate || '100%'}
                </span>
              </div>

              <div>
                <span className="text-light-muted dark:text-dark-muted block mb-1">Tham gia:</span>
                <span className="text-sm font-semibold text-light-text dark:text-dark-text">
                  {stats.joinedText || 'Gần đây'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ── Products Section ── */}
        <div id="vendor-products-list" ref={productsRef} className="space-y-6">
          
          {/* Header & Category Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-light-text dark:text-dark-text">
                Tất cả sản phẩm của Shop
              </h2>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                Hiển thị {meta.totalItems} sản phẩm có sẵn
              </p>
            </div>

            {/* In-shop search input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Tìm sản phẩm trong Shop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-primary shadow-sm"
              />
              <Search className="w-4 h-4 text-light-muted absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Category Chips */}
          {vendor.categories && vendor.categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => handleCategorySelect('')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === ''
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white dark:bg-dark-card text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text border border-light-border dark:border-dark-border'
                }`}
              >
                Tất cả ({stats.totalProducts || meta.totalItems})
              </button>
              {vendor.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white dark:bg-dark-card text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text border border-light-border dark:border-dark-border'
                  }`}
                >
                  {cat.name} {cat.productCount !== undefined ? `(${cat.productCount})` : ''}
                </button>
              ))}
            </div>
          )}

          {/* Product Grid */}
          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 transition-opacity duration-200 ${
            isFetchingProducts && !isLoadingProducts ? 'opacity-60 pointer-events-none' : 'opacity-100'
          }`}>
            {isLoadingProducts ? (
              [...Array(12)].map((_, i) => <ProductCardSkeleton key={i} />)
            ) : products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center card-surface rounded-2xl border-dashed">
                <Store className="w-12 h-12 text-light-muted dark:text-dark-muted mx-auto mb-3 opacity-30" />
                <p className="text-base font-semibold text-light-text dark:text-dark-text">
                  Không tìm thấy sản phẩm phù hợp
                </p>
                <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                  Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!isLoadingProducts && meta.totalPages > 1 && (
            <div className="mt-8 border-t border-light-border dark:border-dark-border pt-6">
              <Pagination
                currentPage={page}
                totalPages={meta.totalPages}
                totalItems={meta.totalItems}
                itemsPerPage={12}
                onPageChange={handlePageChange}
              />
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
