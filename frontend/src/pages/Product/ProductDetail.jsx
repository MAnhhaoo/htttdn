import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  ChevronRight,
  ChevronLeft,
  Package,
  Store,
  Star,
  MessageSquare,
  Zap,
  Loader2,
  Truck,
  ShieldCheck,
  Ticket,
  ChevronDown,
} from 'lucide-react';
import { useProductById, useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useFavorites } from '../../hooks/useFavorites';
import { useToast } from '../../components/common/Toast/Toast';
import { formatPrice } from '../../utils/formatPrice';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import ProductGrid from '../../components/product/ProductGrid/ProductGrid';
import { vendorService } from '../../services/vendorService';
import { reviewService } from '../../services/reviewService';
import {
  computeProductVoucherDeal,
  buildCheckoutVoucherState,
  formatVoucherShortLabel,
  extractVendorLocation,
  formatCompactSold,
} from '../../utils/voucherPrice';
import {
  VoucherTicketCheckIcon,
  DiscountCornerBadge,
  PreferredBadge,
  PromoImageRibbon,
  VoucherSerratedChip,
} from '../../components/product/VoucherBadges';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, offers, isLoading, isError } = useProductById(id);
  const { addToCart, isAdding } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavorite: checkIsFavorite, toggleFavorite: mutateToggleFavorite } = useFavorites();
  const toast = useToast();

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mainImgError, setMainImgError] = useState(false);
  const [vendorProfile, setVendorProfile] = useState(null);
  const isFavorite = checkIsFavorite(product?.id);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [selectedStarFilter, setSelectedStarFilter] = useState(0);
  const [selectedVendorCode, setSelectedVendorCode] = useState(undefined);
  const [selectedPlatformCode, setSelectedPlatformCode] = useState(undefined);

  // Fetch vendor public statistics
  useEffect(() => {
    if (product?.vendor?.id) {
      vendorService.getPublicProfile(product.vendor.id)
        .then(res => setVendorProfile(res))
        .catch(console.error);
    }
  }, [product?.vendor?.id]);

  // Fetch product reviews
  useEffect(() => {
    if (!product?.id) return;
    setReviewsLoading(true);
    setSelectedStarFilter(0);
    reviewService.getByProduct(product.id)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        setReviews(list);
      })
      .catch(console.error)
      .finally(() => setReviewsLoading(false));
  }, [product?.id]);

  // Derived image state from selected color
  const images = selectedColor?.imageUrls || [];
  const mainImageUrl = images[currentImageIndex] || null;

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để lưu sản phẩm yêu thích');
      navigate('/login');
      return;
    }
    try {
      const res = await mutateToggleFavorite(product.id, product);
      if (res?.favorited) {
        toast.success('Đã lưu vào yêu thích');
      } else {
        toast.success('Đã bỏ yêu thích');
      }
    } catch {
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

  // Reset scroll position and manual voucher overrides when product changes
  useEffect(() => {
    setSelectedVendorCode(undefined);
    setSelectedPlatformCode(undefined);
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

  const currentPrice = selectedVariant ? selectedVariant.price : 0;
  const vendorId = product?.vendor?.id || product?.vendorId || 'platform';
  const deal = computeProductVoucherDeal(currentPrice, quantity, offers, product?.id, {
    selectedVendorCode,
    selectedPlatformCode,
  });

  const handleVoucherChipClick = (offer) => {
    const minOrder = Number(offer.minOrderAmount || 0);
    if (minOrder > deal.originalTotal) {
      const needed = minOrder - deal.originalTotal;
      toast.info(
        `Mua thêm ${formatPrice(needed)} (đơn từ ${formatPrice(minOrder)}) để áp dụng mã ${offer.code}`,
      );
      return;
    }

    if (offer.scope === 'vendor') {
      const isCurrentlyActive = deal.vendorOffer?.code === offer.code;
      setSelectedVendorCode(isCurrentlyActive ? null : offer.code);
    } else if (offer.scope === 'platform') {
      const isCurrentlyActive = deal.platformOffer?.code === offer.code;
      setSelectedPlatformCode(isCurrentlyActive ? null : offer.code);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để tiến hành mua hàng');
      navigate('/login');
      return;
    }
    if (!selectedVariant || selectedVariant.stock <= 0) {
      toast.error('Sản phẩm đã hết hàng hoặc chưa chọn phân loại');
      return;
    }

    setIsBuyingNow(true);
    try {
      const res = await addToCart({
        productVariantId: selectedVariant.id,
        quantity,
      });
      const cartItems = res?.items || (res?.data && res.data.items) || [];
      const targetItem =
        cartItems.find((i) => i.productVariantId === selectedVariant.id) ||
        cartItems[cartItems.length - 1];

      const voucherState = buildCheckoutVoucherState(deal, vendorId);
      if (targetItem?.id) {
        navigate('/checkout', {
          state: { cartItemIds: [targetItem.id], ...voucherState },
        });
      } else {
        navigate('/checkout', { state: voucherState });
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      if (status === 401) {
        toast.info('Phiên đăng nhập đã hết hạn');
        navigate('/login');
      } else {
        toast.error(message || 'Không thể tiến hành mua ngay');
      }
    } finally {
      setIsBuyingNow(false);
    }
  };

  if (isLoading) return <Loading text="Đang tải sản phẩm..." />;
  if (isError || !product) return <EmptyState title="Không tìm thấy sản phẩm" description="Sản phẩm này không tồn tại hoặc đã bị xóa." />;

  const isOutOfStock = !selectedVariant || selectedVariant.stock === 0;
  const vendorLocation = extractVendorLocation(product.vendor);
  const soldCount = Number(product.soldQuantity || 0);
  const showPreferredBadge =
    deal.hasDiscount || soldCount >= 5 || Boolean(product.vendor?.id || product.vendorId);

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? Number((reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / totalReviews).toFixed(1))
    : 0;
  const starCounts = [5, 4, 3, 2, 1].reduce((acc, star) => {
    acc[star] = reviews.filter((r) => Number(r.rating) === star).length;
    return acc;
  }, {});
  const filteredReviews = selectedStarFilter === 0
    ? reviews
    : reviews.filter((r) => Number(r.rating) === selectedStarFilter);

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

            {/* Top-right Discount Corner Badge */}
            {deal.hasDiscount && (
              <DiscountCornerBadge
                percent={deal.discountPercent}
                className="absolute top-0 right-0 z-10 text-sm px-3 py-1"
              />
            )}

            {/* Bottom-left Promotional Ribbon */}
            {!isOutOfStock && (
              <PromoImageRibbon
                hasShopOffer={deal.shopOffers.length > 0}
                hasPlatformOffer={deal.platformOffers.length > 0}
                hasDiscount={deal.hasDiscount}
              />
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
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/45 text-white text-xs font-medium backdrop-blur-sm z-10">
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
                  onClick={() => {
                    setCurrentImageIndex(idx);
                    setMainImgError(false);
                  }}
                  className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                    currentImageIndex === idx
                      ? 'border-[#1A3A2C] dark:border-[#C9A84C] shadow-md shadow-[#1A3A2C]/20 ring-1 ring-[#C9A84C]/35'
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

        {/* ── Product Info (Shopee Promotional Buy Box) ── */}
        <div className="flex flex-col">
          {/* Title with inline Yêu thích+ badge */}
          <h1 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text mb-3 leading-snug font-sans">
            {showPreferredBadge && <PreferredBadge size="md" />}
            <span>{product.name}</span>
          </h1>

          {/* Rating + Reviews + Sold Summary Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#product-reviews-section"
                className="inline-flex items-center gap-1.5 text-[#1A3A2C] dark:text-[#DEC47E] font-bold hover:opacity-80 transition-opacity"
              >
                <span className="underline underline-offset-4">
                  {totalReviews > 0 ? avgRating.toFixed(1) : '5.0'}
                </span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        (totalReviews > 0 ? star <= Math.round(avgRating) : true)
                          ? 'fill-[#C9A84C] text-[#C9A84C]'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </a>

              <span className="text-light-border dark:text-dark-border">|</span>

              <a
                href="#product-reviews-section"
                className="text-light-muted dark:text-dark-muted hover:text-[#1A3A2C] dark:hover:text-[#DEC47E] transition-colors"
              >
                <strong className="text-light-text dark:text-dark-text underline underline-offset-4">
                  {totalReviews}
                </strong>{' '}
                Đánh Giá
              </a>

              <span className="text-light-border dark:text-dark-border">|</span>

              <span className="text-light-muted dark:text-dark-muted">
                Đã Bán{' '}
                <strong className="text-light-text dark:text-dark-text">
                  {formatCompactSold(soldCount)}
                </strong>
              </span>
            </div>

            {product.category?.name && (
              <Link
                to={`/products?category=${product.category.slug}`}
                className="px-2.5 py-0.5 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-primary rounded-full text-xs font-medium transition-colors"
              >
                {product.category.name}
              </Link>
            )}
          </div>

          {/* Promotional Price Banner */}
          {deal.hasDiscount ? (
            <section
              aria-label="Giá sau giảm"
              className="mb-6 rounded-xl overflow-hidden border border-[#2A5C4A]/30 dark:border-[#C9A84C]/30 shadow-xs"
            >
              <div className="bg-gradient-to-r from-[#1A3A2C] via-[#234B3A] to-[#2A5C4A] text-[#F5ECD7] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-[#C9A84C] shrink-0" />
                  <span>
                    {deal.vendorOffer && deal.platformOffer
                      ? 'Ưu đãi gộp Voucher Shop + Toàn Sàn'
                      : 'Giá ưu đãi dành riêng cho bạn'}
                  </span>
                </span>
                <span className="bg-[#C9A84C]/20 text-[#F5ECD7] border border-[#C9A84C]/35 px-2 py-0.5 rounded text-xs font-bold">
                  Tiết kiệm {formatPrice(deal.discountAmount)} (-{deal.discountPercent}%)
                </span>
              </div>

              <div className="bg-[#EEF5F1]/80 dark:bg-[#13221B] px-4 sm:px-5 py-4 space-y-1.5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#1A3A2C] dark:text-[#DEC47E] tracking-tight">
                    {formatPrice(deal.totalAmount)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#2A5C4A] dark:text-[#C9A84C]">
                    <VoucherTicketCheckIcon className="w-4 h-4" />
                    <span>Giá Sau Voucher</span>
                  </span>
                  <span className="text-sm sm:text-base text-light-muted dark:text-dark-muted line-through">
                    {formatPrice(deal.originalTotal)}
                  </span>
                </div>

                <p className="text-xs text-light-muted dark:text-dark-muted">
                  {deal.vendorOffer && deal.platformOffer ? (
                    <>
                      Đã tính gộp mã Shop{' '}
                      <strong className="text-[#1A3A2C] dark:text-[#DEC47E]">
                        {deal.vendorOffer.code}
                      </strong>{' '}
                      (-{formatPrice(deal.vendorDiscount)}) + mã Sàn{' '}
                      <strong className="text-[#1A3A2C] dark:text-[#DEC47E]">
                        {deal.platformOffer.code}
                      </strong>{' '}
                      (-{formatPrice(deal.platformDiscount)})
                      {quantity > 1 ? ` cho ${quantity} sản phẩm` : ''}.
                    </>
                  ) : (
                    <>
                      Áp dụng mã{' '}
                      <strong className="text-[#1A3A2C] dark:text-[#DEC47E]">
                        {(deal.vendorOffer || deal.platformOffer)?.code}
                      </strong>{' '}
                      (-{formatPrice(deal.discountAmount)})
                      {quantity > 1 ? ` cho ${quantity} sản phẩm` : ''}. Tự động áp mã khi bấm Mua Với Voucher.
                    </>
                  )}
                </p>
              </div>
            </section>
          ) : (
            <div className="mb-6 rounded-xl bg-light-surface/80 dark:bg-dark-surface px-4 sm:px-5 py-4 border border-light-border/60 dark:border-dark-border/60 space-y-1.5">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#1A3A2C] dark:text-[#DEC47E]">
                {formatPrice(deal.originalTotal || currentPrice)}
              </div>
              {deal.nextUnlockOffer && (
                <p className="text-xs sm:text-sm text-[#2A5C4A] dark:text-[#8BBAA1] font-medium">
                  Mua thêm <strong>{formatPrice(deal.nextUnlockOffer.shortfall)}</strong> để mở khóa mã{' '}
                  <strong>{deal.nextUnlockOffer.code}</strong> (
                  {formatVoucherShortLabel(deal.nextUnlockOffer)} — tiết kiệm tới{' '}
                  {formatPrice(deal.nextUnlockOffer.potentialDiscount)})
                </p>
              )}
            </div>
          )}

          {/* Structured Shopee-Style Detail Rows */}
          <div className="space-y-4 text-sm mb-6">
            {/* Shop Voucher Chips Row */}
            {deal.shopOffers.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <span className="w-32 shrink-0 text-light-muted dark:text-dark-muted text-xs sm:text-sm sm:pt-1">
                  Mã Giảm Giá Của Shop
                </span>
                <div className="flex flex-wrap items-center gap-2.5 flex-1">
                  {deal.shopOffers.map((offer) => {
                    const isEligible = Number(offer.minOrderAmount || 0) <= deal.originalTotal;
                    const isSelected = deal.vendorOffer?.code === offer.code;
                    return (
                      <VoucherSerratedChip
                        key={offer.id || offer.code}
                        offer={offer}
                        selected={isSelected}
                        eligible={isEligible}
                        onClick={() => handleVoucherChipClick(offer)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Platform Voucher Chips Row */}
            {deal.platformOffers.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <span className="w-32 shrink-0 text-light-muted dark:text-dark-muted text-xs sm:text-sm sm:pt-1">
                  Ưu Đãi Toàn Sàn
                </span>
                <div className="flex flex-wrap items-center gap-2.5 flex-1">
                  {deal.platformOffers.map((offer) => {
                    const isEligible = Number(offer.minOrderAmount || 0) <= deal.originalTotal;
                    const isSelected = deal.platformOffer?.code === offer.code;
                    return (
                      <VoucherSerratedChip
                        key={offer.id || offer.code}
                        offer={offer}
                        selected={isSelected}
                        eligible={isEligible}
                        onClick={() => handleVoucherChipClick(offer)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipping Row */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4">
              <span className="w-32 shrink-0 text-light-muted dark:text-dark-muted text-xs sm:text-sm">
                Vận Chuyển
              </span>
              <div className="flex items-start gap-2 flex-1">
                <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <p className="font-medium text-light-text dark:text-dark-text">
                    Miễn phí vận chuyển toàn quốc
                  </p>
                  <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                    Giao từ {vendorLocation} • Nhận hàng nhanh trong 2–4 ngày
                  </p>
                </div>
              </div>
            </div>

            {/* Buyer Protection Row */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4">
              <span className="w-32 shrink-0 text-light-muted dark:text-dark-muted text-xs sm:text-sm">
                An Tâm Mua Sắm
              </span>
              <details className="group flex-1 text-xs sm:text-sm">
                <summary className="list-none inline-flex items-center gap-1.5 cursor-pointer text-light-text dark:text-dark-text font-medium select-none">
                  <ShieldCheck className="w-4 h-4 text-[#2A5C4A] dark:text-[#C9A84C] shrink-0" />
                  <span>Đổi ý miễn phí 15 ngày • Bảo hiểm bảo vệ người tiêu dùng</span>
                  <ChevronDown className="w-3.5 h-3.5 text-light-muted group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-1.5 pl-5.5 text-xs text-light-muted dark:text-dark-muted leading-relaxed">
                  Hỗ trợ trả hàng hoàn tiền trong vòng 15 ngày nếu sản phẩm lỗi từ nhà sản xuất hoặc không đúng mô tả. Cam kết chính hãng 100% trên sàn MIVA.
                </p>
              </details>
            </div>
          </div>

          <div className="w-full h-[1px] bg-light-border dark:bg-dark-border mb-6" />

          {/* Colors Row */}
          {product.colors?.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-4 mb-5">
              <span className="w-32 shrink-0 text-light-muted dark:text-dark-muted text-xs sm:text-sm sm:pt-2">
                Màu Sắc
              </span>
              <div className="flex flex-wrap gap-2.5 flex-1">
                {product.colors.map((colorOption) => {
                  const isSelected = selectedColor?.id === colorOption.id;
                  return (
                    <button
                      key={colorOption.id}
                      onClick={() => handleColorSelect(colorOption)}
                      className={`px-4 py-2 text-xs sm:text-sm font-medium border rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1A3A2C] bg-[#EEF5F1] dark:border-[#C9A84C] dark:bg-[#1A3A2C]/50 text-[#1A3A2C] dark:text-[#F5ECD7] font-semibold'
                          : 'border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-[#2A5C4A] dark:hover:border-[#C9A84C]/60'
                      }`}
                    >
                      {colorOption.color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Variants / Sizes Row */}
          {selectedColor?.variants?.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-4 mb-5">
              <span className="w-32 shrink-0 text-light-muted dark:text-dark-muted text-xs sm:text-sm sm:pt-2">
                Phân Loại
              </span>
              <div className="flex flex-wrap gap-2.5 flex-1">
                {selectedColor.variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const isAvailable = variant.stock > 0;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => isAvailable && handleVariantSelect(variant)}
                      disabled={!isAvailable}
                      className={`min-w-[68px] px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-all text-center ${
                        isSelected
                          ? 'border-[#1A3A2C] bg-[#EEF5F1] dark:border-[#C9A84C] dark:bg-[#1A3A2C]/50 text-[#1A3A2C] dark:text-[#F5ECD7] font-semibold cursor-pointer'
                          : isAvailable
                            ? 'border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-[#2A5C4A] dark:hover:border-[#C9A84C]/60 cursor-pointer'
                            : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed line-through'
                      }`}
                    >
                      {variant.size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity + Stock Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 mb-7">
            <span className="w-32 shrink-0 text-light-muted dark:text-dark-muted text-xs sm:text-sm">
              Số Lượng
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center border border-light-border dark:border-dark-border rounded-lg h-10 bg-white dark:bg-dark-card">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={isOutOfStock || quantity <= 1}
                  className="w-10 h-full flex items-center justify-center text-light-muted hover:text-[#1A3A2C] dark:hover:text-[#DEC47E] disabled:opacity-40 transition-colors cursor-pointer border-r border-light-border dark:border-dark-border"
                  aria-label="Giảm số lượng"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-12 text-center font-bold text-sm text-light-text dark:text-dark-text select-none">
                  {quantity}
                </div>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={isOutOfStock || quantity >= (selectedVariant?.stock || 0)}
                  className="w-10 h-full flex items-center justify-center text-light-muted hover:text-[#1A3A2C] dark:hover:text-[#DEC47E] disabled:opacity-40 transition-colors cursor-pointer border-l border-light-border dark:border-dark-border"
                  aria-label="Tăng số lượng"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {selectedVariant && (
                <span className="text-xs sm:text-sm text-light-muted dark:text-dark-muted">
                  {selectedVariant.stock > 0
                    ? `${selectedVariant.stock} sản phẩm có sẵn`
                    : 'Hết hàng'}
                </span>
              )}
            </div>
          </div>

          {/* Dual CTA Buttons (Thêm Vào Giỏ Hàng + Mua Với Voucher <số tiền> + Yêu thích) */}
          <div className="mt-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding || isBuyingNow}
              className="flex-1 h-13 sm:h-14 px-5 border border-[#1A3A2C] bg-[#EEF5F1] dark:border-[#579678] dark:bg-[#1A3A2C]/40 text-[#1A3A2C] dark:text-[#DCEAE2] hover:bg-[#DCEAE2] dark:hover:bg-[#1A3A2C]/70 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isAdding ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
              <span>{isAdding ? 'Đang thêm...' : 'Thêm Vào Giỏ Hàng'}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock || isAdding || isBuyingNow}
              className="flex-1 h-13 sm:h-14 px-5 bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#2A5C4A] dark:hover:bg-[#35755B] text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#1A3A2C]/20 active:scale-98 cursor-pointer"
            >
              {isBuyingNow ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : isOutOfStock ? (
                <span>Hết hàng</span>
              ) : deal.hasDiscount ? (
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-xs font-medium text-[#EAD8A6]">Mua Với Voucher</span>
                  <span className="text-base sm:text-lg font-extrabold">
                    {formatPrice(deal.totalAmount)}
                  </span>
                </div>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-[#DEC47E]" />
                  <span>Mua Ngay · {formatPrice(deal.originalTotal || currentPrice)}</span>
                </>
              )}
            </button>

            <button
              onClick={toggleFavorite}
              className={`h-13 sm:h-14 sm:w-14 px-4 sm:px-0 border rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                isFavorite
                  ? 'border-[#C9A84C] bg-[#FBF7EC] dark:bg-[#C9A84C]/15 text-[#C9A84C]'
                  : 'border-light-border dark:border-dark-border text-light-muted hover:text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#FBF7EC] dark:hover:bg-[#C9A84C]/15'
              }`}
              title="Yêu thích"
              aria-label="Yêu thích"
            >
              <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${isFavorite ? 'fill-current' : ''}`} />
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
            <div className="grid grid-cols-3 gap-y-3.5 gap-x-6 sm:gap-x-8 text-xs text-light-muted dark:text-dark-muted flex-1 lg:max-w-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                <span>Đánh Giá</span>
                <span className="font-semibold text-[#1A3A2C] dark:text-[#DEC47E]">
                  {vendorProfile?.stats?.rating || 5.0} ★ ({vendorProfile?.stats?.reviewCount || 0})
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                <span>Sản Phẩm</span>
                <span className="font-semibold text-[#1A3A2C] dark:text-[#DEC47E]">
                  {vendorProfile?.stats?.totalProducts || 0}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                <span>Tham Gia</span>
                <span className="font-semibold text-[#1A3A2C] dark:text-[#DEC47E]">
                  {vendorProfile?.stats?.joinedText || 'Gần đây'}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Product Description Section ── */}
      {product.description && (
        <section className="mt-8 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="bg-light-surface/70 dark:bg-dark-surface px-4 py-3 rounded-xl mb-4">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-light-text dark:text-dark-text">
              Mô Tả Sản Phẩm
            </h2>
          </div>
          <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-light-text/90 dark:text-dark-text/90 leading-relaxed whitespace-pre-line px-1">
            {product.description}
          </div>
        </section>
      )}

      {/* ── Product Reviews Section ── */}
      <section
        id="product-reviews-section"
        className="mt-8 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 shadow-sm"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
            Đánh Giá Sản Phẩm
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
            {totalReviews}
          </span>
        </div>

        {/* Rating Overview & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 p-5 sm:p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 mb-6">
          <div className="flex flex-col items-center justify-center min-w-[160px] md:border-r border-amber-200/80 dark:border-amber-800/50 md:pr-6">
            <div className="text-3xl sm:text-4xl font-black text-amber-500">
              {totalReviews > 0 ? avgRating.toFixed(1) : '0.0'}
              <span className="text-lg font-semibold text-light-muted dark:text-dark-muted"> / 5</span>
            </div>
            <div className="flex items-center gap-1 my-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    totalReviews > 0 && star <= Math.round(avgRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-light-muted dark:text-dark-muted">
              ({totalReviews} lượt đánh giá)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <button
              type="button"
              onClick={() => setSelectedStarFilter(0)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                selectedStarFilter === 0
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-light-border dark:border-dark-border bg-white dark:bg-dark-surface text-light-text dark:text-dark-text hover:border-primary/50'
              }`}
            >
              Tất cả ({totalReviews})
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedStarFilter(star)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all inline-flex items-center gap-1 ${
                  selectedStarFilter === star
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-light-border dark:border-dark-border bg-white dark:bg-dark-surface text-light-text dark:text-dark-text hover:border-primary/50'
                }`}
              >
                <span>{star} Sao</span>
                <span className="opacity-75">({starCounts[star] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Review Items */}
        {reviewsLoading ? (
          <div className="py-12 text-center text-sm text-light-muted dark:text-dark-muted">
            Đang tải đánh giá sản phẩm...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-12 text-center">
            <Star className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2 stroke-1" />
            <p className="text-sm font-medium text-light-muted dark:text-dark-muted">
              {totalReviews === 0
                ? 'Chưa có đánh giá nào cho sản phẩm này.'
                : `Không có đánh giá ${selectedStarFilter} sao nào.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-light-border dark:divide-dark-border">
            {filteredReviews.map((rev) => {
              const clientName = rev.client?.fullName || 'Khách hàng MIVA';
              const clientAvatar = rev.client?.avatarUrl;
              const variantColor = rev.orderDetail?.productVariant?.productColor?.color;
              const variantSize = rev.orderDetail?.productVariant?.size;
              const reviewDate = rev.createdAt
                ? new Date(rev.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <div key={rev.id} className="py-5 first:pt-2 last:pb-2 flex gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden">
                    {clientAvatar ? (
                      <img
                        src={clientAvatar}
                        alt={clientName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      clientName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-light-text dark:text-dark-text">
                        {clientName}
                      </span>
                      {reviewDate && (
                        <span className="text-xs text-light-muted dark:text-dark-muted">
                          {reviewDate}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= Number(rev.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>

                    {(variantColor || variantSize) && (
                      <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                        Phân loại hàng: {[variantColor && `Màu ${variantColor}`, variantSize && `Size ${variantSize}`].filter(Boolean).join(', ')}
                      </p>
                    )}

                    <p className="mt-2.5 text-sm text-light-text dark:text-dark-text leading-relaxed whitespace-pre-line">
                      {rev.content || 'Sản phẩm chất lượng tốt, đóng gói cẩn thận.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

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

      <ProductGrid
        products={similar}
        isLoading={isLoading}
        skeletonCount={4}
        columns={4}
      />
    </section>
  );
}
