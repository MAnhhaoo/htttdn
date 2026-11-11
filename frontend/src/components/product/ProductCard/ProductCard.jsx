import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Loader2, Heart, Zap } from 'lucide-react';
import { useSelector } from 'react-redux';
import { formatPrice } from '../../../utils/formatPrice';
import { useCart } from '../../../hooks/useCart';
import { useToast } from '../../common/Toast/Toast';
import { useState, useEffect } from 'react';
import QuickAddModal from '../QuickAddModal/QuickAddModal';
import { bestVoucherPrice } from '../../../utils/voucherPrice';

import { useQueryClient } from '@tanstack/react-query';

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [quickAddInitialMode, setQuickAddInitialMode] = useState('add_to_cart');

  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const { addToCart } = useCart();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [isFavorite, setIsFavorite] = useState(false);

  // Derived image state from selected color
  // Backend toCatalogProduct() already provides these fields
  const imageUrl = product.thumbnail;
  const price = product.minPrice;
  const maxPrice = product.maxPrice;
  const totalStock = product.totalStock ?? 0;
  const showPriceRange = maxPrice && price && maxPrice !== price;
  const voucherPrice = bestVoucherPrice(price, 1, product.voucherOffers, product.id);

  // Variant analysis for cart logic
  const allVariants = product.colors?.flatMap(c => c.variants || []) || [];
  const purchasableVariants = allVariants.filter(v => v.stock > 0);
  const hasSingleVariant = purchasableVariants.length === 1;
  const hasMultipleVariants = purchasableVariants.length > 1;

  // Fetch initial favorite status
  useEffect(() => {
    if (product?.id && isAuthenticated) {
      import('../../../services/apiClient').then(({ apiClient }) => {
        apiClient.get(`/products/${product.id}/favorite-status`)
          .then(res => setIsFavorite(res.favorited))
          .catch(console.error);
      });
    }
  }, [product?.id, isAuthenticated]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để lưu sản phẩm yêu thích');
      navigate('/login');
      return;
    }
    try {
      const { apiClient } = await import('../../../services/apiClient');
      if (isFavorite) {
        await apiClient.delete(`/products/${product.id}/favorite`);
        setIsFavorite(false);
      } else {
        await apiClient.post(`/products/${product.id}/favorite`);
        setIsFavorite(true);
        toast.success('Đã lưu vào yêu thích');
      }
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
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
        const targetItem = cartItems.find((i) => i.productVariantId === purchasableVariants[0].id) || cartItems[cartItems.length - 1];
        if (targetItem?.id) {
          navigate('/checkout', { state: { cartItemIds: [targetItem.id] } });
        } else {
          navigate('/checkout');
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
        className="group flex flex-col card-surface rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
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

          {/* Out of stock overlay */}
          {totalStock === 0 && (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 bg-red-500/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">
                Hết hàng
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={toggleFavorite}
            className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full shadow-sm transition-all duration-200 z-10 ${
              isFavorite 
                ? 'bg-red-50 text-red-500 hover:scale-110' 
                : 'bg-white text-gray-700 hover:text-red-500 hover:scale-110'
            }`}
            aria-label="Yêu thích"
          >
            <Heart className={`w-[18px] h-[18px] ${isFavorite ? 'fill-current' : ''}`} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1">
          {/* Category */}
          {product.category?.name && (
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-primary mb-1.5 truncate">
              {product.category.name}
            </span>
          )}

          {/* Name */}
          <h3 className="font-sans font-semibold text-light-text dark:text-dark-text text-sm leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-auto">
            {price ? (
              <div>
                {showPriceRange && (
                  <p className="text-[10px] sm:text-xs text-light-muted dark:text-dark-muted mb-0.5">Từ</p>
                )}
                <p className="font-bold text-sm sm:text-base text-primary leading-tight">
                  {formatPrice(price)}
                </p>
                {voucherPrice && <div className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                  <strong>{formatPrice(voucherPrice.totalAmount)}</strong> với mã <span className="font-semibold">{voucherPrice.code}</span>
                </div>}
              </div>
            ) : (
              <p className="text-sm text-light-muted dark:text-dark-muted italic">Liên hệ</p>
            )}
          </div>

          {/* Action buttons (Mua ngay + Thêm vào giỏ) */}
          {totalStock > 0 ? (
            <div className="mt-3 pt-2.5 border-t border-light-border/60 dark:border-dark-border/40 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleBuyNowClick}
                disabled={isBuyingNow || isAddingToCart}
                className="flex-1 h-8 sm:h-8.5 px-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-xs active:scale-95 disabled:opacity-60 cursor-pointer"
                title="Mua ngay"
              >
                {isBuyingNow ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                <span>Mua ngay</span>
              </button>

              <button
                type="button"
                onClick={handleCartClick}
                disabled={isAddingToCart || isBuyingNow}
                className="shrink-0 w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white active:scale-95 disabled:opacity-60 transition-all cursor-pointer"
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
            <div className="mt-3 pt-2.5 border-t border-light-border/60 dark:border-dark-border/40">
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
