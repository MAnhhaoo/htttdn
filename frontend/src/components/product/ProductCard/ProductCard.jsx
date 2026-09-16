import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../store/cartSlice';
import { toggleWishlist } from '../../../store/userSlice';
import { formatPrice } from '../../../utils/formatPrice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ product }));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist(product));
  };

  return (
    <Link to={`/products/${product.id}`} className="group relative bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl overflow-hidden hover:shadow-luxury transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.discount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discount}%
          </span>
        )}
        {product.isFlashDeal && (
          <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">
            Flash
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={handleWishlist}
        className="absolute top-3 right-3 z-10 p-2 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm rounded-full text-light-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <Heart className="w-4 h-4" />
      </button>

      {/* Image */}
      <div className="aspect-square bg-gray-100 dark:bg-dark-bg overflow-hidden">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-sm text-light-text dark:text-dark-text line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2 mb-3 mt-auto">
          <div className="flex items-center text-primary text-xs font-medium">
            <span className="text-yellow-400 mr-1">★</span> {product.rating}
          </div>
          <span className="text-xs text-light-muted dark:text-dark-muted">|</span>
          <span className="text-xs text-light-muted dark:text-dark-muted">{product.sold} sold</span>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-lg font-bold text-light-text dark:text-dark-text">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice > product.price && (
              <div className="text-xs text-light-muted dark:text-dark-muted line-through">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors flex-shrink-0"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
