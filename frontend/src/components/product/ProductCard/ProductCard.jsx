import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Loader2, Heart, Zap, MapPin } from 'lucide-react';
import { useSelector } from 'react-redux';
import { formatPrice } from '../../../utils/formatPrice';
import { useCart } from '../../../hooks/useCart';
import { useFavorites } from '../../../hooks/useFavorites';
import { useToast } from '../../common/Toast/Toast';
import QuickAddModal from '../QuickAddModal/QuickAddModal';
import {
  computeProductVoucherDeal,
  buildCheckoutVoucherState,
  formatVoucherShortLabel,
  formatCompactVnd,
  extractVendorLocation,
  formatCompactSold,
} from '../../../utils/voucherPrice';
import {
  VoucherTicketCheckIcon,
  DiscountCornerBadge,
  PromoImageRibbon,
  PreferredBadge,
  PromoOutlineTag,
} from '../VoucherBadges';

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [quickAddInitialMode, setQuickAddInitialMode] = useState('add_to_cart');

  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const toast = useToast();

  const favorited = isFavorite(product?.id);

  // Backend toCatalogProduct() already provides these fields
  const imageUrl = product.thumbnail;
  const price = product.minPrice;
  const maxPrice = product.maxPrice;
  const totalStock = product.totalStock ?? 0;
  const showPriceRange = Boolean(maxPrice && price && maxPrice !== price);
  const deal = computeProductVoucherDeal(price, 1, product.voucherOffers, product.id);
  const vendorId = product.vendor?.id || product.vendorId || 'platform';
  const vendorLocation = extractVendorLocation(product.vendor);
  const soldCount = Number(product.soldQuantity || 0);
  const showPreferredBadge =
    deal.hasDiscount || soldCount >= 5 || Boolean(product.vendor?.id || product.vendorId);

  // Variant analysis for cart logic
  const allVariants = product.colors?.flatMap((c) => c.variants || []) || [];
  const purchasableVariants = allVariants.filter((v) => v.stock > 0);
  const hasSingleVariant = purchasableVariants.length === 1;
  const hasMultipleVariants = purchasableVariants.length > 1;

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để lưu sản phẩm yêu thích');
      navigate('/login');
      return;
    }
    try {
      const res = await toggleFavorite(product.id, product);
      if (res?.favorited) {
        toast.success('Đã lưu vào yêu thích');
      } else {
        toast.info('Đã bỏ khỏi danh sách yêu thích');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi cập nhật trạng thái yêu thích');
    }
  };

  const handleCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    if (hasSingleVariant) {
      setIsAddingToCart(true);
      try {
        await addToCart({ productVariantId: purchasableVariants[0].id, quantity: 1 });
        toast.success('Đã thêm vào giỏ hàng');
      } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message;
        if (status === 401) {
          toast.info('Phiên đăng nhập đã hết hạn');
          navigate('/login');
        } else if (message) {
          toast.error(message);
        } else {
          toast.error('Lỗi kết nối, vui lòng thử lại');
        }
      } finally {
        setIsAddingToCart(false);
      }
    } else if (hasMultipleVariants) {
      setQuickAddInitialMode('add_to_cart');
      setShowQuickAdd(true);
    }
  };

  const handleBuyNowClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để tiến hành mua hàng');
      navigate('/login');
      return;
    }

    if (hasSingleVariant) {
      setIsBuyingNow(true);
      try {
        const res = await addToCart({ productVariantId: purchasableVariants[0].id, quantity: 1 });
        const cartItems = res?.items || (res?.data && res.data.items) || [];
        const targetItem =
          cartItems.find((i) => i.productVariantId === purchasableVariants[0].id) ||
          cartItems[cartItems.length - 1];
        if (targetItem?.id) {
          navigate('/checkout', {
            state: {
              cartItemIds: [targetItem.id],
              ...buildCheckoutVoucherState(deal, vendorId),
            },
          });
        } else {
          navigate('/checkout', {
            state: buildCheckoutVoucherState(deal, vendorId),
          });
        }
      } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message;
        if (status === 401) {
          toast.info('Phiên đăng nhập đã hết hạn');
          navigate('/login');
        } else if (message) {
          toast.error(message);
        } else {
          toast.error('Lỗi kết nối, vui lòng thử lại');
        }
      } finally {
        setIsBuyingNow(false);
      }
    } else if (hasMultipleVariants) {
      setQuickAddInitialMode('buy_now');
      setShowQuickAdd(true);
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  return (
    <>
      <Link
        to={`/products/${product.id}`}
        className="group flex flex-col card-surface rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 hover:border-[#C9A84C]/60 transition-all duration-300"
      >
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-light-surface dark:bg-dark-surface">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
              <Package className="w-10 h-10 text-primary/30" strokeWidth={1.5} />
              <span className="text-xs text-primary/40 font-medium">Chưa có ảnh</span>
            </div>
          )}

          {/* Top-right Discount Corner Badge (-73%) */}
          {deal.hasDiscount && (
            <DiscountCornerBadge
              percent={deal.discountPercent}
              className="absolute top-0 right-0 z-10"
            />
          )}

          {/* Out of stock overlay */}
          {totalStock === 0 && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="px-2.5 py-1 bg-[#0E2219]/85 text-[#F5ECD7] border border-[#C9A84C]/30 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">
                Hết hàng
              </span>
            </div>
          )}

          {/* Bottom-left Promotional Ribbon (VOUCHER XTRA | SIÊU RẺ) */}
          {totalStock > 0 && (
            <PromoImageRibbon
              hasShopOffer={deal.shopOffers.length > 0}
              hasPlatformOffer={deal.platformOffers.length > 0}
              hasDiscount={deal.hasDiscount}
            />
          )}

          {/* Wishlist Button (bottom-right so it never overlaps -XX% badge) */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`absolute bottom-2 right-2 w-7.5 h-7.5 flex items-center justify-center rounded-full shadow-sm transition-all duration-200 z-10 cursor-pointer ${
              favorited
                ? 'bg-[#FBF7EC] text-[#C9A84C] border border-[#C9A84C]/40 hover:scale-110'
                : 'bg-white/90 text-[#1A3A2C] hover:text-[#C9A84C] hover:scale-110 backdrop-blur-xs'
            }`}
            aria-label="Yêu thích"
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} strokeWidth={1.7} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-3.5 flex flex-col flex-1">
          {/* Name with inline Yêu thích+ badge */}
          <h3 className="font-sans font-medium text-light-text dark:text-dark-text text-xs sm:text-sm leading-snug line-clamp-2 mb-2 group-hover:text-[#1A3A2C] dark:group-hover:text-[#DEC47E] transition-colors">
            {showPreferredBadge && <PreferredBadge />}
            <span>{product.name}</span>
          </h3>

          {/* Promo Outline Tags */}
          {deal.hasDiscount ? (
            <div className="flex flex-wrap items-center gap-1 mb-2">
              <PromoOutlineTag>
                {deal.discountPercent >= 20
                  ? 'Ưu Đãi Độc Quyền'
                  : formatVoucherShortLabel(deal.vendorOffer || deal.platformOffer)}
              </PromoOutlineTag>
              <PromoOutlineTag>Giá Sau Voucher</PromoOutlineTag>
            </div>
          ) : deal.nextUnlockOffer ? (
            <div className="flex flex-wrap items-center gap-1 mb-2">
              <PromoOutlineTag>
                {formatVoucherShortLabel(deal.nextUnlockOffer)} đơn từ{' '}
                {formatCompactVnd(deal.nextUnlockOffer.minOrderAmount)}₫
              </PromoOutlineTag>
            </div>
          ) : product.category?.name ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2 truncate">
              {product.category.name}
            </span>
          ) : null}

          {/* Price + Location & Sold Meta */}
          <div className="mt-auto">
            {price ? (
              deal.hasDiscount ? (
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-base sm:text-lg text-[#1A3A2C] dark:text-[#DEC47E] leading-tight">
                      {formatPrice(deal.unitFinalPrice)}
                    </span>
                    <VoucherTicketCheckIcon className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-light-muted dark:text-dark-muted line-through leading-tight mt-0.5">
                    {showPriceRange ? 'Từ ' : ''}
                    {formatPrice(price)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-sm sm:text-base text-[#1A3A2C] dark:text-[#DEC47E] leading-tight">
                    {showPriceRange && (
                      <span className="text-[11px] font-normal text-light-muted dark:text-dark-muted mr-1">
                        Từ
                      </span>
                    )}
                    {formatPrice(price)}
                  </p>
                </div>
              )
            ) : (
              <p className="text-sm text-light-muted dark:text-dark-muted italic">Liên hệ</p>
            )}

            {/* Meta Footer: Vendor Location + Sold Count */}
            <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-light-muted dark:text-dark-muted">
              <span className="inline-flex items-center gap-1 min-w-0 truncate">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{vendorLocation}</span>
              </span>
              {soldCount > 0 && (
                <span className="shrink-0">Đã bán {formatCompactSold(soldCount)}</span>
              )}
            </div>
          </div>

          {/* Action buttons (Mua ngay + icon giỏ hàng) */}
          {totalStock > 0 ? (
            <div className="mt-2.5 pt-2.5 border-t border-light-border/60 dark:border-dark-border/40 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleBuyNowClick}
                disabled={isBuyingNow || isAddingToCart}
                className="flex-1 h-8 sm:h-8.5 px-2.5 rounded-lg bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#2A5C4A] dark:hover:bg-[#35755B] text-white text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-xs active:scale-95 disabled:opacity-60 cursor-pointer"
                title={deal.hasDiscount ? 'Mua ngay với Voucher' : 'Mua ngay'}
              >
                {isBuyingNow ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-[#DEC47E]" />
                )}
                <span>Mua ngay</span>
              </button>

              <button
                type="button"
                onClick={handleCartClick}
                disabled={isAddingToCart || isBuyingNow}
                className="shrink-0 w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg bg-[#EEF5F1] text-[#1A3A2C] border border-[#B9D6C6]/70 hover:bg-[#1A3A2C] hover:text-white dark:bg-[#1A3A2C]/50 dark:text-[#B9D6C6] dark:border-[#2A5C4A] dark:hover:bg-[#C9A84C] dark:hover:text-[#0E2219] flex items-center justify-center active:scale-95 disabled:opacity-60 transition-all cursor-pointer"
                aria-label="Thêm vào giỏ"
                title="Thêm vào giỏ hàng"
              >
                {isAddingToCart ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShoppingCart className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ) : (
            <div className="mt-2.5 pt-2.5 border-t border-light-border/60 dark:border-dark-border/40">
              <span className="block w-full py-1 text-center text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg">
                Hết hàng
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddModal
          product={product}
          initialMode={quickAddInitialMode}
          onClose={() => {
            setShowQuickAdd(false);
            setQuickAddInitialMode('add_to_cart');
          }}
        />
      )}
    </>
  );
}
