import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Plus, ShoppingCart, Package, Loader2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCart } from '../../../hooks/useCart';
import { useVoucherOffers } from '../../../hooks/useVoucherOffers';
import { useToast } from '../../common/Toast/Toast';
import { formatPrice } from '../../../utils/formatPrice';
import { computeProductVoucherDeal, buildCheckoutVoucherState } from '../../../utils/voucherPrice';
import { VoucherTicketCheckIcon, DiscountCornerBadge } from '../VoucherBadges';

export default function QuickAddModal({ product, onClose, initialMode = 'add_to_cart' }) {
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const { addToCart } = useCart();
  const toast = useToast();

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Initialize with first color and first available variant
  useEffect(() => {
    if (product.colors?.length > 0) {
      const firstColor = product.colors[0];
      setSelectedColor(firstColor);
      const firstAvailable = firstColor.variants?.find(v => v.stock > 0) || firstColor.variants?.[0] || null;
      setSelectedVariant(firstAvailable);
    }
  }, [product]);

  // Escape key + lock body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setImgError(false);
    const firstAvailable = color.variants?.find(v => v.stock > 0) || color.variants?.[0] || null;
    setSelectedVariant(firstAvailable);
    setQuantity(1);
  };

  const handleVariantSelect = (variant) => {
    if (variant.stock <= 0) return;
    setSelectedVariant(variant);
    setQuantity(1);
  };

  const handleQuantityChange = (delta) => {
    if (!selectedVariant) return;
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= selectedVariant.stock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thêm vào giỏ hàng');
      onClose();
      navigate('/login');
      return;
    }

    if (!selectedVariant || selectedVariant.stock <= 0) return;

    setIsLoading(true);
    try {
      await addToCart({ productVariantId: selectedVariant.id, quantity });
      toast.success('Đã thêm vào giỏ hàng');
      onClose();
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 401) {
        toast.info('Phiên đăng nhập đã hết hạn');
        onClose();
        navigate('/login');
      } else if (status === 400) {
        toast.error(message || 'Thông tin không hợp lệ');
      } else if (status === 404) {
        toast.error('Sản phẩm không còn tồn tại');
      } else {
        toast.error(message || 'Lỗi kết nối, vui lòng thử lại');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để tiến hành mua hàng');
      onClose();
      navigate('/login');
      return;
    }

    if (!selectedVariant || selectedVariant.stock <= 0) return;

    setIsBuyingNow(true);
    try {
      const res = await addToCart({ productVariantId: selectedVariant.id, quantity });
      const cartItems = res?.items || (res?.data && res.data.items) || [];
      const targetItem = cartItems.find((i) => i.productVariantId === selectedVariant.id) || cartItems[cartItems.length - 1];
      onClose();
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
        onClose();
        navigate('/login');
      } else {
        toast.error(message || 'Lỗi kết nối, vui lòng thử lại');
      }
    } finally {
      setIsBuyingNow(false);
    }
  };

  const fallbackOffers = useVoucherOffers(product?.voucherOffers ? [] : [product?.id]);
  const activeOffers = product?.voucherOffers || fallbackOffers;
  const currentImage = selectedColor?.imageUrls?.[0] || product?.thumbnail || null;
  const currentPrice = selectedVariant?.price || 0;
  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;
  const deal = computeProductVoucherDeal(currentPrice, quantity, activeOffers, product?.id);
  const vendorId = product?.vendor?.id || product?.vendorId || 'platform';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-xl text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface dark:hover:bg-dark-surface transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-6">
          {/* Product header */}
          <div className="flex gap-4 mb-6 pr-8">
            {/* Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-light-surface dark:bg-dark-surface shrink-0">
              {currentImage && !imgError ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-primary/30" strokeWidth={1.5} />
                </div>
              )}
              {deal.hasDiscount && (
                <DiscountCornerBadge
                  percent={deal.discountPercent}
                  className="absolute top-0 right-0 z-10 text-[10px] px-1.5 py-0.5"
                />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1 block">
                {initialMode === 'buy_now'
                  ? 'Mua ngay với ưu đãi'
                  : product.category?.name || 'Chọn phân loại'}
              </span>
              <h3 className="font-semibold text-light-text dark:text-dark-text text-sm sm:text-base leading-snug line-clamp-2 mb-1.5">
                {product.name}
              </h3>
              {deal.hasDiscount ? (
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-[#1A3A2C] dark:text-[#DEC47E] text-lg leading-tight">
                      {formatPrice(deal.unitFinalPrice)}
                    </span>
                    <VoucherTicketCheckIcon className="w-4 h-4" />
                    <span className="text-xs text-light-muted dark:text-dark-muted line-through">
                      {formatPrice(currentPrice)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#2A5C4A] dark:text-[#8BBAA1] font-medium mt-0.5">
                    Tiết kiệm {formatPrice(deal.discountAmount)}
                    {quantity > 1 ? ` cho ${quantity} SP` : ''}
                  </p>
                </div>
              ) : (
                <p className="font-bold text-[#1A3A2C] dark:text-[#DEC47E] text-lg">
                  {formatPrice(currentPrice)}
                </p>
              )}
            </div>
          </div>

          {/* Color selector */}
          {product.colors?.length > 1 && (
            <div className="mb-5">
              <label className="text-xs font-bold uppercase tracking-wider text-light-text dark:text-dark-text mb-2.5 block font-sans">
                Màu sắc:{' '}
                <span className="font-normal text-light-muted dark:text-dark-muted">
                  {selectedColor?.color}
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => handleColorSelect(color)}
                    className={`px-3.5 py-2 text-sm font-medium border rounded-xl transition-all ${
                      selectedColor?.id === color.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-primary/50'
                    }`}
                  >
                    {color.color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variant selector */}
          {selectedColor?.variants?.length > 0 && (
            <div className="mb-5">
              <label className="text-xs font-bold uppercase tracking-wider text-light-text dark:text-dark-text mb-2.5 block font-sans">
                Phân loại:{' '}
                <span className="font-normal text-light-muted dark:text-dark-muted">
                  {selectedVariant?.size}
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedColor.variants.map((variant) => {
                  const isAvailable = variant.stock > 0;
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantSelect(variant)}
                      disabled={!isAvailable}
                      className={`px-3.5 py-2 text-sm font-medium border rounded-xl transition-all ${
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : isAvailable
                            ? 'border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-primary/50'
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

          {/* Stock info */}
          {selectedVariant && (
            <p className="text-xs text-light-muted dark:text-dark-muted mb-4">
              {selectedVariant.stock > 0
                ? `Còn ${selectedVariant.stock} sản phẩm`
                : 'Hết hàng'}
            </p>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="text-xs font-bold uppercase tracking-wider text-light-text dark:text-dark-text mb-2.5 block font-sans">
              Số lượng
            </label>
            <div className="inline-flex items-center border border-light-border dark:border-dark-border rounded-xl h-11 bg-white dark:bg-dark-surface">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={isOutOfStock || quantity <= 1}
                className="w-11 h-full flex items-center justify-center text-light-muted hover:text-primary disabled:opacity-40 transition-colors rounded-l-xl"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="w-12 text-center font-bold text-sm text-light-text dark:text-dark-text select-none">
                {quantity}
              </div>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={isOutOfStock || quantity >= (selectedVariant?.stock || 0)}
                className="w-11 h-full flex items-center justify-center text-light-muted hover:text-primary disabled:opacity-40 transition-colors rounded-r-xl"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLoading || isBuyingNow}
              className="flex-1 h-12 border border-[#1A3A2C] bg-[#EEF5F1] dark:border-[#579678] dark:bg-[#1A3A2C]/40 text-[#1A3A2C] dark:text-[#DCEAE2] hover:bg-[#DCEAE2] dark:hover:bg-[#1A3A2C]/70 font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
              <span className="text-xs sm:text-sm">
                {isLoading ? 'Đang thêm...' : 'Thêm Vào Giỏ'}
              </span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock || isLoading || isBuyingNow}
              className="flex-1 h-12 bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#2A5C4A] dark:hover:bg-[#35755B] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#1A3A2C]/20 cursor-pointer"
            >
              {isBuyingNow ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs sm:text-sm">Đang xử lý...</span>
                </>
              ) : isOutOfStock ? (
                <span className="text-xs sm:text-sm">Hết hàng</span>
              ) : deal.hasDiscount ? (
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-[11px] font-medium text-[#EAD8A6]">Mua Với Voucher</span>
                  <span className="text-sm font-extrabold">{formatPrice(deal.totalAmount)}</span>
                </div>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-[#DEC47E]" />
                  <span className="text-xs sm:text-sm">Mua ngay</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
