import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Plus, ShoppingCart, Package, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCart } from '../../../hooks/useCart';
import { useToast } from '../../common/Toast/Toast';
import { formatPrice } from '../../../utils/formatPrice';

export default function QuickAddModal({ product, onClose }) {
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

  const currentImage = selectedColor?.imageUrls?.[0] || null;
  const currentPrice = selectedVariant?.price || 0;
  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

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
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-light-surface dark:bg-dark-surface shrink-0">
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
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {product.category?.name && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1 block">
                  {product.category.name}
                </span>
              )}
              <h3 className="font-semibold text-light-text dark:text-dark-text text-sm sm:text-base leading-snug line-clamp-2 mb-2">
                {product.name}
              </h3>
              <p className="font-bold text-primary text-lg">
                {formatPrice(currentPrice)}
              </p>
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

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isLoading}
            className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
            {isOutOfStock
              ? 'Hết hàng'
              : isLoading
                ? 'Đang thêm...'
                : 'Thêm vào giỏ hàng'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
