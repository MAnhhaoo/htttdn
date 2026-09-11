'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ h: '08', m: '51', s: '59' });

  useEffect(() => {
    async function loadData() {
      try {
        const [catsRes, trendingRes, flashRes, newRes, bestRes] = await Promise.all([
          api.getCategories(),
          api.getTrending(),
          api.getFlashSale(),
          api.getNewArrivals(),
          api.getBestSellers()
        ]);
        
        setCategories(catsRes.data || []);
        setTrending(trendingRes.data?.slice(0, 5) || []);
        setFlashDeals(flashRes.data?.slice(0, 5) || []);
        setRecommended(newRes.data?.slice(0, 5) || []);
        setBestSellers(bestRes.data?.slice(0, 5) || []);
      } catch (e) {
        console.error('Failed to load homepage data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Simple countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let s = parseInt(prev.s) - 1;
        let m = parseInt(prev.m);
        let h = parseInt(prev.h);
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return { 
          h: h.toString().padStart(2, '0'), 
          m: m.toString().padStart(2, '0'), 
          s: s.toString().padStart(2, '0') 
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Map category slugs to generic icons for the UI
  const getCategoryIcon = (slug) => {
    const icons = {
      'electronics': '💻',
      'fashion': '👗',
      'beauty': '✨',
      'home-living': '🏠',
      'sports': '⚽',
      'books': '📚',
      'toys': '🧸',
      'health': '❤️'
    };
    return icons[slug] || '🛍️';
  };

  if (loading) {
    return (
      <div className="container section">
        <div className="skeleton" style={{ height: 480, borderRadius: 20, marginBottom: 40 }}></div>
        <div className="skeleton" style={{ height: 120, borderRadius: 10, marginBottom: 40 }}></div>
        <div className="product-grid">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 10 }}></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="section pb-0 pt-6">
        <div className="container">
          <div className="hero">
            <div className="hero-content">
              <span className="hero-badge">New Collection</span>
              <h1>Everything You Need.</h1>
              <p>Discover products you'll love, all in one place. Premium quality, fast shipping, and secure payments.</p>
              <div className="hero-actions">
                <Link href="/products" className="btn btn-primary btn-lg">Shop Now</Link>
                <Link href="/deals" className="btn btn-secondary btn-lg">View Deals</Link>
              </div>
            </div>
            <div className="hero-image">
              <img src="https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?q=80&w=2070" alt="Miva Premium Electronics" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Categories</h2>
          </div>
          <div className="category-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {categories.slice(0, 4).map(cat => (
              <Link href={`/category/${cat.slug}`} key={cat.id} className="category-card">
                <div className="category-icon">{getCategoryIcon(cat.slug)}</div>
                <div className="category-name">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products & Flash Deals (Side by side on desktop) */}
      <section className="section pt-0">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--space-6)' }}>
            
            {/* Trending */}
            <div>
              <div className="section-header">
                <h2 className="section-title">Trending Products</h2>
                <Link href="/products?sort=popular" className="section-link">View All</Link>
              </div>
              <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {trending.slice(0, 4).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>

            {/* Flash Deals Sidebar */}
            <div>
              <div className="section-header" style={{ marginBottom: 'var(--space-4)' }}>
                <h2 className="section-title">Flash Deals</h2>
              </div>
              <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--bg-card)' }}>
                <div className="countdown" style={{ justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
                  <div className="countdown-block">{timeLeft.h}</div>
                  <span className="countdown-separator">:</span>
                  <div className="countdown-block">{timeLeft.m}</div>
                  <span className="countdown-separator">:</span>
                  <div className="countdown-block">{timeLeft.s}</div>
                </div>
                
                {flashDeals[0] && (
                  <Link href={`/products/${flashDeals[0].product.slug}`} style={{ display: 'block', textAlign: 'center' }}>
                    <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
                      <img src={flashDeals[0].product.images[0]} alt={flashDeals[0].product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div className="product-card-badge" style={{ fontSize: '14px', padding: '4px 8px' }}>
                        {flashDeals[0].discount}% OFF
                      </div>
                    </div>
                    <h3 className="product-card-name" style={{ marginBottom: 'var(--space-2)' }}>{flashDeals[0].product.name}</h3>
                    <div className="product-card-price" style={{ justifyContent: 'center' }}>
                      <span className="price-current" style={{ color: 'var(--error)' }}>${flashDeals[0].dealPrice}</span>
                      <span className="price-original">${flashDeals[0].originalPrice}</span>
                    </div>
                    <div className="deal-progress">
                      <div className="deal-progress-bar" style={{ width: `${(flashDeals[0].sold / flashDeals[0].stock) * 100}%` }}></div>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                      {flashDeals[0].sold} sold
                    </div>
                  </Link>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Recommended For You */}
      <section className="section bg-secondary">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Recommended For You</h2>
            <Link href="/products?sort=newest" className="section-link">Discover More</Link>
          </div>
          <div className="product-grid">
            {recommended.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Best Sellers</h2>
              <p className="section-subtitle">Our most popular products based on sales</p>
            </div>
          </div>
          <div className="product-grid">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Miva & Newsletter */}
      <section className="section pt-0">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-10)', alignItems: 'center' }}>
            
            <div>
              <h2 className="section-title" style={{ marginBottom: 'var(--space-8)' }}>Why Choose Miva</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>🛡️</div>
                  <h4 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>Secure Payment</h4>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Multiple secure payment options for your peace of mind.</p>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>🚀</div>
                  <h4 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>Fast Delivery</h4>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Lightning fast shipping across the country.</p>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>↩️</div>
                  <h4 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>Easy Returns</h4>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>30-day return policy for all premium items.</p>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>🎧</div>
                  <h4 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>24/7 Support</h4>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Dedicated customer service team ready to help.</p>
                </div>
              </div>
            </div>

            <div className="newsletter">
              <h2>Newsletter</h2>
              <p>Subscribe to get updates on new products and exclusive deals.</p>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Enter your email address" required />
                <button type="submit" className="btn btn-primary" style={{ background: 'white', color: 'var(--text-primary)' }}>Subscribe</button>
              </form>
            </div>

          </div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 1024px) {
          section > .container > div[style*="grid-template-columns: 3fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          section > .container > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
