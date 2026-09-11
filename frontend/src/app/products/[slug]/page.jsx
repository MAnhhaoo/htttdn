'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug; // This acts as the ID/slug based on backend routing
  
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await api.getProduct(slug);
        if (res.success && res.data) {
          setProduct(res.data);
          if (res.data.variants && res.data.variants.length > 0) {
            setSelectedVariant(res.data.variants[0]);
          }
          // Fetch similar products
          const simRes = await api.getSimilar(res.data.id);
          if (simRes.success) setSimilarProducts(simRes.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    const success = await addToCart({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      originalPrice: product.originalPrice,
      variant: selectedVariant || 'Default',
      quantity: quantity
    });
    if (success) {
      addToast('Added to cart successfully!', 'success');
    } else {
      addToast('Failed to add to cart.', 'error');
    }
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
    addToast('Wishlist updated', 'success');
  };

  if (loading) {
    return (
      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-10)' }}>
          <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)' }}></div>
          <div>
            <div className="skeleton" style={{ height: 40, width: '80%', marginBottom: 20 }}></div>
            <div className="skeleton" style={{ height: 30, width: '40%', marginBottom: 40 }}></div>
            <div className="skeleton" style={{ height: 100, width: '100%', marginBottom: 40 }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section empty-state">
        <div className="empty-state-icon">🚫</div>
        <h3>Product Not Found</h3>
        <p>The product you are looking for does not exist or has been removed.</p>
        <Link href="/products" className="btn btn-primary">Back to Products</Link>
      </div>
    );
  }

  const isWished = isInWishlist(product.id);

  return (
    <div className="container section">
      {/* Breadcrumb */}
      <div className="breadcrumb" style={{ marginBottom: 'var(--space-6)' }}>
        <Link href="/">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link href="/products">Products</Link>
        <span className="breadcrumb-separator">/</span>
        <Link href={`/category/${product.categoryId}`}>{product.categoryName || 'Category'}</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-10)', marginBottom: 'var(--space-12)' }}>
        {/* Left: Image Gallery */}
        <div>
          <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-4)', border: '1px solid var(--border-color)' }}>
            <img 
              src={product.images[activeImage]} 
              alt={product.name} 
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 'var(--space-4)' }} 
            />
            {product.discount > 0 && (
              <div className="product-card-badge" style={{ top: 16, left: 16, background: 'var(--error)' }}>
                {product.discount}% OFF
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-4)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
            {product.images.map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveImage(idx)}
                style={{ 
                  width: 80, height: 80, borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  border: activeImage === idx ? '2px solid var(--gold)' : '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)', padding: 'var(--space-1)', flexShrink: 0
                }}
              >
                <img src={img} alt={`${product.name} ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)', lineHeight: 1.2 }}>{product.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map(star => (
                <svg key={star} className={star <= Math.round(product.rating) ? '' : 'star-empty'} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>{product.rating} ({product.reviews} Reviews)</span>
            <span style={{ color: 'var(--text-tertiary)' }}>|</span>
            <span style={{ color: 'var(--text-secondary)' }}>{product.soldCount} Sold</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--error)' }}>${product.price.toFixed(2)}</span>
            {product.originalPrice > product.price && (
              <span style={{ fontSize: 'var(--text-lg)', color: 'var(--text-tertiary)', textDecoration: 'line-through', marginBottom: '4px' }}>${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          {product.variants && product.variants.length > 0 && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>Options: <span style={{ fontWeight: 'normal', color: 'var(--text-secondary)' }}>{selectedVariant}</span></div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                {product.variants.map(v => (
                  <button 
                    key={v}
                    onClick={() => setSelectedVariant(v)}
                    className={`btn ${selectedVariant === v ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '8px 16px', minWidth: 'auto', borderRadius: 'var(--radius-sm)' }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>Quantity</div>
            <div className="quantity-selector" style={{ width: '120px', height: '44px' }}>
              <button className="quantity-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <input type="text" className="quantity-value" value={quantity} readOnly />
              <button className="quantity-btn" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
              {product.stock} items available
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <button className="btn btn-primary btn-lg" style={{ flex: 2 }} onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={() => { handleAddToCart(); window.location.href = '/checkout'; }}>
              Buy Now
            </button>
            <button 
              className={`btn btn-outline btn-lg`} 
              style={{ flex: 0, padding: '0 20px', color: isWished ? 'var(--error)' : 'inherit', borderColor: isWished ? 'var(--error)' : 'var(--border-color)' }}
              onClick={handleWishlist}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={isWished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            </button>
          </div>

          {/* Shipping & Returns preview */}
          <div className="card" style={{ padding: 'var(--space-4)', background: 'transparent', boxShadow: 'none' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Free Shipping</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>For orders over $50.00</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21L21.5 8"/></svg>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Return Delivery</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Free 30 Days Delivery Returns</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 'var(--space-12)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-8)', borderBottom: '1px solid var(--border-color)', marginBottom: 'var(--space-6)' }}>
          <button 
            className={`nav-link ${activeTab === 'description' ? 'active' : ''}`} 
            onClick={() => setActiveTab('description')}
            style={{ paddingBottom: 'var(--space-3)', fontSize: 'var(--text-lg)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: activeTab === 'description' ? 600 : 400 }}
          >
            Description
          </button>
          <button 
            className={`nav-link ${activeTab === 'seller' ? 'active' : ''}`} 
            onClick={() => setActiveTab('seller')}
            style={{ paddingBottom: 'var(--space-3)', fontSize: 'var(--text-lg)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: activeTab === 'seller' ? 600 : 400 }}
          >
            Seller Info
          </button>
          <button 
            className={`nav-link ${activeTab === 'specs' ? 'active' : ''}`} 
            onClick={() => setActiveTab('specs')}
            style={{ paddingBottom: 'var(--space-3)', fontSize: 'var(--text-lg)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: activeTab === 'specs' ? 600 : 400 }}
          >
            Specifications
          </button>
        </div>
        
        <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          {activeTab === 'description' && (
            <div dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br/>') || 'No description available.' }} />
          )}
          {activeTab === 'seller' && (
            <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                {product.sellerName ? product.sellerName.charAt(0) : 'S'}
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>{product.sellerName || 'Miva Official Store'}</h3>
                <div style={{ display: 'flex', gap: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
                  <span><strong style={{ color: 'var(--text-primary)' }}>4.9</strong> / 5 Rating</span>
                  <span><strong style={{ color: 'var(--text-primary)' }}>98%</strong> Positive Feedback</span>
                  <span><strong style={{ color: 'var(--text-primary)' }}>10k+</strong> Followers</span>
                </div>
                <button className="btn btn-outline btn-sm" style={{ marginTop: 'var(--space-4)' }}>Visit Store</button>
              </div>
            </div>
          )}
          {activeTab === 'specs' && (
            <div>
              <p>Detailed specifications for this product will be displayed here.</p>
              <table style={{ width: '100%', maxWidth: '600px', marginTop: 'var(--space-4)', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: 'var(--space-3) 0', fontWeight: 600 }}>Brand</td>
                    <td style={{ padding: 'var(--space-3) 0' }}>Miva Verified</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: 'var(--space-3) 0', fontWeight: 600 }}>Stock</td>
                    <td style={{ padding: 'var(--space-3) 0' }}>{product.stock} items</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: 'var(--space-3) 0', fontWeight: 600 }}>Ships From</td>
                    <td style={{ padding: 'var(--space-3) 0' }}>Domestic Warehouse</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section>
          <div className="section-header">
            <h2 className="section-title">You May Also Like</h2>
          </div>
          <div className="product-grid">
            {similarProducts.slice(0, 5).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
