'use client';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export default function ProductCard({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  if (!product) return null;

  const isWished = isInWishlist(product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await addToCart({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      originalPrice: product.originalPrice,
      variant: product.variants?.[0] || 'Default',
      quantity: 1
    });
    if (success) {
      addToast('Added to cart successfully!', 'success');
    } else {
      addToast('Failed to add to cart.', 'error');
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    if (!isWished) addToast('Added to wishlist', 'success');
  };

  return (
    <Link href={`/products/${product.slug || product.id}`} className="product-card">
      <div className="product-card-image">
        <img src={product.images[0]} alt={product.name} loading="lazy" />
        {product.discount > 0 && (
          <div className="product-card-badge">{product.discount}% OFF</div>
        )}
        <button 
          className={`product-card-wishlist ${isWished ? 'active' : ''}`}
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isWished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
      </div>

      <div className="product-card-body">
        <h3 className="product-card-name" title={product.name}>{product.name}</h3>
        
        <div className="product-card-rating">
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(star => (
              <svg key={star} className={star <= Math.round(product.rating) ? '' : 'star-empty'} width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <span>({product.reviews})</span>
        </div>

        <div className="product-card-price">
          <span className="price-current">${product.price.toFixed(2)}</span>
          {product.originalPrice > product.price && (
            <span className="price-original">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        <div className="product-card-actions">
          <button className="btn btn-primary btn-full btn-sm" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
