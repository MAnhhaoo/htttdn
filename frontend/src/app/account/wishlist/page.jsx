'use client';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { items } = useWishlist();

  return (
    <div className="card" style={{ padding: 'var(--space-8)' }}>
      <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-6)' }}>My Wishlist</h2>
      
      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">❤️</div>
          <h3>Your wishlist is empty</h3>
          <p>Save items you like here to easily find them later.</p>
        </div>
      ) : (
        <div className="product-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {items.map(item => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}
