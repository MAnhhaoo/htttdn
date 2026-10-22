import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Heart, ChevronRight, ChevronLeft, Package, Store, ShieldCheck } from 'lucide-react';
import { useProductById, useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast/Toast';
import { formatPrice } from '../../utils/formatPrice';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import ProductCardSkeleton from '../../components/product/ProductCard/ProductCardSkeleton';
import { vendorService } from '../../services/vendorService';
import { bestVoucherPrice } from '../../utils/voucherPrice';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, offers, isLoading, isError } = useProductById(id);
  const { addToCart, isAdding } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mainImgError, setMainImgError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [vendorProfile, setVendorProfile] = useState(null);

  // Fetch vendor public statistics
  useEffect(() => {
    if (product?.vendor?.id) {
      vendorService.getPublicProfile(product.vendor.id)
        .then(res => setVendorProfile(res))
        .catch(console.error);
    }
  }, [product?.vendor?.id]);

  // Derived image state from selected color
  const images = selectedColor?.imageUrls || [];
  const mainImageUrl = images[currentImageIndex] || null;

  useEffect(() => {
    if (product && isAuthenticated) {
      import('../../services/apiClient').then(({ apiClient }) => {
        apiClient.get(`/products/${product.id}/favorite-status`)
          .then(res => setIsFavorite(res.favorited))
          .catch(console.error);
      });
    }
  }, [product, isAuthenticated]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để lưu sản phẩm yêu thích');
      navigate('/login');
      return;
    }
    try {
      const { apiClient } = await import('../../services/apiClient');
      if (isFavorite) {
        await apiClient.delete(`/products/${product.id}/favorite`);
        setIsFavorite(false);
        toast.success('Đã bỏ yêu thích');
      } else {
        await apiClient.post(`/products/${product.id}/favorite`);
        setIsFavorite(true);
        toast.success('Đã lưu vào yêu thích');
      }
    } catch (e) {
      toast.error('Lỗi khi cập nhật trạng thái yêu thích');
    }
  };

  useEffect(() => {
    if (product && product.colors?.length > 0) {
      const firstColor = product.colors[0];
      setSelectedColor(firstColor);
      setCurrentImageIndex(0);
      setMainImgError(false);
      if (firstColor.variants?.length > 0) {
        setSelectedVariant(firstColor.variants[0]);
      }
    }
  }, [product]);

  // Reset scroll position when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setCurrentImageIndex(0);
    setMainImgError(false);
    if (color.variants?.length > 0) {
      setSelectedVariant(color.variants[0]);
    } else {
      setSelectedVariant(null);
    }
    setQuantity(1);
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  const handleImageNav = (delta) => {
    setCurrentImageIndex(prev => {
      const newIndex = prev + delta;
      if (newIndex < 0) return images.length - 1;
      if (newIndex >= images.length) return 0;
      return newIndex;
    });
    setMainImgError(false);
  };

  const handleQuantityChange = (delta) => {
    if (!selectedVariant) return;
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= selectedVariant.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }
    if (!selectedVariant) return;

    try {
      await addToCart({
        productVariantId: selectedVariant.id,
        quantity
      });
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      if (status === 401) {
        toast.info('Phiên đăng nhập đã hết hạn');
        navigate('/login');
      } else {
        toast.error(message || 'Không thể thêm vào giỏ hàng');
      }
    }
  };

  if (isLoading) return <Loading text="Đang tải sản phẩm..." />;
  if (isError || !product) return <EmptyState title="Không tìm thấy sản phẩm" description="Sản phẩm này không tồn tại hoặc đã bị xóa." />;

  const currentPrice = selectedVariant ? selectedVariant.price : 0;
  const voucherPrice = bestVoucherPrice(currentPrice, quantity, offers, product.id);
  const isOutOfStock = !selectedVariant || selectedVariant.stock === 0;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <Link to="/products" className="hover:text-primary transition-colors">Sản phẩm</Link>
        {product.category && (
          <>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link to={`/products?category=${product.category.slug}`} className="hover:text-primary transition-colors">{product.category.name}</Link>
          </>
        )}
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span className="text-light-text dark:text-dark-text font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* ── Image Gallery ── */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-light-surface dark:bg-dark-surface rounded-2xl overflow-hidden border border-light-border dark:border-dark-border group">
            {mainImageUrl && !mainImgError ? (
              <img
                key={mainImageUrl}
                src={mainImageUrl}
                alt={product.name}
                className="w-full h-full object-cover gallery-fade-in"
                onError={() => setMainImgError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                <Package className="w-16 h-16 text-primary/20" strokeWidth={1} />
                <span className="text-sm text-light-muted dark:text-dark-muted">Chưa có ảnh</span>
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => handleImageNav(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm border border-light-border/50 dark:border-dark-border/50 flex items-center justify-center text-light-text dark:text-dark-text hover:bg-white dark:hover:bg-dark-card hover:shadow-lg transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleImageNav(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm border border-light-border/50 dark:border-dark-border/50 flex items-center justify-center text-light-text dark:text-dark-text hover:bg-white dark:hover:bg-dark-card hover:shadow-lg transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                  aria-label="Ảnh tiếp theo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image counter badge */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 text-white text-xs font-medium backdrop-blur-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setCurrentImageIndex(idx); setMainImgError(false); }}
                  className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    currentImageIndex === idx
                      ? 'border-primary shadow-md shadow-primary/20 ring-1 ring-primary/30'
                      : 'border-transparent hover:border-light-border dark:hover:border-dark-border opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`Xem ảnh ${idx + 1}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="flex flex-col">
          {product.category?.name && (
            <div className="mb-3">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
                {product.category.name}
              </span>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-black text-light-text dark:text-dark-text mb-4 leading-tight">
            {product.name}
          </h1>

          <div className="text-3xl font-bold text-primary mb-6">
            {formatPrice(currentPrice)}
          </div>
          {voucherPrice && <section aria-label="Giá sau giảm" className="mb-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-4 text-emerald-800 dark:text-emerald-300 space-y-1">
            <p>Giá sau giảm cho {quantity} sản phẩm: <strong>{formatPrice(voucherPrice.totalAmount)}</strong></p>
            <p className="text-sm">Tiết kiệm {formatPrice(voucherPrice.discountAmount)} khi dùng mã <strong>{voucherPrice.code}</strong>.</p>
            <p className="text-xs">Chọn mã tại giỏ hàng hoặc thanh toán. Áp dụng khi còn lượt và tài khoản đủ điều kiện.</p>
            {offers.length > 1 && <details className="pt-2 text-sm"><summary className="cursor-pointer">Xem các mã khác</summary>
              {offers.map(offer => {
                const value = bestVoucherPrice(currentPrice, quantity, [offer], product.id);
                return <p key={offer.id} className="mt-1">{offer.code}: {value ? formatPrice(value.totalAmount) : `đơn từ ${formatPrice(offer.minOrderAmount || 0)}`}</p>;
              })}
            </details>}
          </section>}
          {!voucherPrice && offers.length > 0 && <p className="mb-6 text-sm text-primary">Có mã giảm giá: {offers.map(offer => `${offer.code}${offer.minOrderAmount ? ` (đơn từ ${formatPrice(offer.minOrderAmount)})` : ''}`).join(', ')}. Chọn mã tại giỏ hàng hoặc thanh toán.</p>}

          <div className="prose dark:prose-invert max-w-none text-light-muted dark:text-dark-muted mb-8">
            <p>{product.description}</p>
          </div>

          <div className="w-full h-[1px] bg-light-border dark:bg-dark-border mb-8" />

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-light-text dark:text-dark-text uppercase tracking-wider mb-3">
                Màu sắc: <span className="text-light-muted dark:text-dark-muted font-normal ml-2">{selectedColor?.color}</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map(colorOption => (
                  <button
                    key={colorOption.id}
                    onClick={() => handleColorSelect(colorOption)}
                    className={`px-4 py-2 text-sm font-medium border rounded-xl transition-all ${
                      selectedColor?.id === colorOption.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-primary/50'
                    }`}
                  >
                    {colorOption.color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variants / Sizes */}
          {selectedColor?.variants?.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-light-text dark:text-dark-text uppercase tracking-wider">
                  Phân loại: <span className="text-light-muted dark:text-dark-muted font-normal ml-2">{selectedVariant?.size}</span>
                </h3>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {selectedColor.variants.map(variant => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const isAvailable = variant.stock > 0;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => isAvailable && handleVariantSelect(variant)}
                      disabled={!isAvailable}
                      className={`
                        py-3 text-sm font-semibold rounded-xl border transition-all text-center
                        ${isSelected
                          ? 'border-primary bg-primary text-white shadow-md'
                          : isAvailable
                            ? 'border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-primary/50'
                            : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'}
                      `}
                    >
                      {variant.size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock info */}
          {selectedVariant && (
            <p className="text-sm text-light-muted dark:text-dark-muted mb-6">
              {selectedVariant.stock > 0
                ? `Còn ${selectedVariant.stock} sản phẩm trong kho`
                : 'Hết hàng'}
            </p>
          )}

          {/* Actions */}
          <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center border border-light-border dark:border-dark-border rounded-xl h-14 bg-white dark:bg-dark-card shrink-0">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={isOutOfStock || quantity <= 1}
                className="w-12 h-full flex items-center justify-center text-light-muted hover:text-primary disabled:opacity-50 transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="w-12 text-center font-bold text-light-text dark:text-dark-text">
                {quantity}
              </div>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={isOutOfStock || quantity >= selectedVariant?.stock}
                className="w-12 h-full flex items-center justify-center text-light-muted hover:text-primary disabled:opacity-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className="flex-1 h-14 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
            >
              {isAdding ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
              {isOutOfStock ? 'Hết hàng' : isAdding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
            </button>

            <button 
              onClick={toggleFavorite}
              className={`w-14 h-14 border rounded-xl flex items-center justify-center transition-all shrink-0 ${
                isFavorite 
                  ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-500' 
                  : 'border-light-border dark:border-dark-border text-light-muted hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
              }`}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Vendor / Seller Card (Shopee Style) ── */}
      {product?.vendor && (
        <div className="mt-8 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Avatar + Store Name + View Shop Button */}
            <div className="flex items-center gap-4 sm:gap-5 min-w-[260px]">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-primary/20 bg-gray-100 dark:bg-dark-surface shadow-sm flex items-center justify-center shrink-0">
                {product.vendor.avatarUrl ? (
                  <img 
                    src={product.vendor.avatarUrl} 
                    alt={product.vendor.storeName || product.vendor.fullName} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=150&auto=format&fit=crop&q=80';
                    }}
                  />
                ) : (
                  <Store className="w-8 h-8 text-primary" />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-base sm:text-lg text-light-text dark:text-dark-text tracking-tight">
                  {product.vendor.storeName || product.vendor.fullName || 'Cửa hàng đối tác'}
                </h3>

                <div>
                  <Link
                    to={`/shop/${product.vendor.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-surface dark:hover:bg-dark-surface text-xs font-semibold transition-colors"
                  >
                    <Store className="w-3.5 h-3.5 text-primary" />
                    Xem Shop
                  </Link>
                </div>
              </div>
            </div>

            {/* Middle Divider */}
            <div className="hidden lg:block w-[1px] h-16 bg-light-border dark:bg-dark-border" />

            {/* Right: Stats Grid */}
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-8 sm:gap-x-12 text-xs text-light-muted dark:text-dark-muted flex-1 lg:max-w-md">
              <div className="flex items-center justify-between gap-3">
                <span>Đánh Giá</span>
                <span className="font-semibold text-red-500 dark:text-red-400">
                  {vendorProfile?.stats?.rating || 5.0} ★ ({vendorProfile?.stats?.reviewCount || 0})
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span>Tỉ Lệ Phản Hồi</span>
                <span className="font-semibold text-red-500 dark:text-red-400">
                  {vendorProfile?.stats?.responseRate || '100%'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span>Sản Phẩm</span>
                <span className="font-semibold text-red-500 dark:text-red-400">
                  {vendorProfile?.stats?.totalProducts || 0}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span>Tham Gia</span>
                <span className="font-semibold text-red-500 dark:text-red-400">
                  {vendorProfile?.stats?.joinedText || 'Gần đây'}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Recommended Products ── */}
      {product?.category?.slug && (
        <SimilarProducts
          categorySlug={product.category.slug}
          excludeId={product.id}
        />
      )}

      {/* Gallery fade animation */}
      <style>{`
        @keyframes galleryFadeIn {
          from { opacity: 0.4; }
          to { opacity: 1; }
        }
        .gallery-fade-in {
          animation: galleryFadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}

// ── Similar Products Section ──
function SimilarProducts({ categorySlug, excludeId }) {
  const { products, isLoading } = useProducts({ category: categorySlug, limit: 8 });
  const similar = products.filter(p => p.id !== excludeId).slice(0, 4);

  if (!isLoading && similar.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-light-border dark:border-dark-border">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text mb-1">
            Sản phẩm tương tự
          </h2>
          <p className="text-sm text-light-muted dark:text-dark-muted hidden sm:block">
            Có thể bạn cũng thích
          </p>
        </div>
        <Link
          to={`/products?category=${categorySlug}`}
          className="text-primary font-semibold hover:text-primary-dark transition-colors text-sm whitespace-nowrap"
        >
          Xem tất cả →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {isLoading
          ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
          : similar.map(p => <ProductCard key={p.id} product={p} />)
        }
      </div>
    </section>
  );
}
