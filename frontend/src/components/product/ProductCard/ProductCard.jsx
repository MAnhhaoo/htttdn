import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { formatPrice } from '../../../utils/formatPrice';
import { useCart } from '../../../hooks/useCart';
import { useToast } from '../../common/Toast/Toast';
import { useState } from 'react';
import QuickAddModal from '../QuickAddModal/QuickAddModal';

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const { addToCart } = useCart();
  const toast = useToast();

  // Backend toCatalogProduct() already provides these fields
  const imageUrl = product.thumbnail;
  const price = product.minPrice;
  const maxPrice = product.maxPrice;
  const totalStock = product.totalStock ?? 0;
  const showPriceRange = maxPrice && price && maxPrice !== price;

  // Variant analysis for cart logic
  const allVariants = product.colors?.flatMap(c => c.variants || []) || [];
  const purchasableVariants = allVariants.filter(v => v.stock > 0);
  const hasSingleVariant = purchasableVariants.length === 1;
  const hasMultipleVariants = purchasableVariants.length > 1;

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
      setShowQuickAdd(true);
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

          {/* Price + Cart Button */}
          <div className="mt-auto flex items-end justify-between gap-2">
            <div className="min-w-0">
              {price ? (
                <div>
                  {showPriceRange && (
                    <p className="text-[10px] sm:text-xs text-light-muted dark:text-dark-muted mb-0.5">Từ</p>
                  )}
                  <p className="font-bold text-sm sm:text-base text-primary leading-tight">
                    {formatPrice(price)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-light-muted dark:text-dark-muted italic">Liên hệ</p>
              )}
            </div>

            {/* Cart button */}
            {totalStock > 0 && (
              <button
                onClick={handleCartClick}
                disabled={isAddingToCart}
                className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white active:scale-95 disabled:opacity-60 transition-all duration-200"
                aria-label="Thêm vào giỏ"
                title="Thêm vào giỏ"
              >
                {isAddingToCart ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </Link>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddModal
          product={product}
          onClose={() => setShowQuickAdd(false)}
        />
      )}
    </>
  );
}
