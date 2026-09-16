import { useSelector } from 'react-redux';
import { Heart } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import EmptyState from '../../components/common/EmptyState/EmptyState';

export default function Wishlist() {
  const { wishlist } = useSelector(state => state.user);

  if (wishlist.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-sm h-full flex flex-col">
        <div className="p-6 md:p-8 border-b border-light-border dark:border-dark-border">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">My Wishlist</h2>
        </div>
        <div className="flex-1 flex items-center justify-center py-20">
          <EmptyState 
            icon={Heart}
            title="Your wishlist is empty"
            description="Save items you love here to buy them later."
            actionText="Discover Products"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">My Wishlist</h2>
      <p className="text-light-muted dark:text-dark-muted mb-8">
        You have {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved in your wishlist.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {wishlist.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
