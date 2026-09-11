'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function FashionPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getCategory('fashion');
        if (res.success) {
          setProducts(res.data.products || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="home-page">
      {/* Fashion Hero Banner */}
      <section className="section pb-0 pt-4">
        <div className="container">
          <div className="hero" style={{ background: '#F9F5F0', minHeight: '400px' }}>
            <div className="hero-content">
              <span className="hero-badge" style={{ background: '#D2B48C', color: 'white' }}>Spring/Summer 2024</span>
              <h1 style={{ fontSize: 'var(--text-4xl)', color: '#333' }}>Elevate Your Style.</h1>
              <p style={{ color: '#666' }}>Discover the latest trends in men's and women's fashion. Express yourself with Miva.</p>
              <div className="hero-actions">
                <button className="btn btn-primary" style={{ background: '#333' }}>Shop Women</button>
                <button className="btn btn-outline" style={{ borderColor: '#333', color: '#333' }}>Shop Men</button>
              </div>
            </div>
            <div className="hero-image" style={{ width: '50%', right: '0', background: 'none' }}>
              <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800" alt="Fashion Mall" style={{ objectFit: 'cover', opacity: 1, borderRadius: 'var(--radius-xl)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Trending Categories */}
      <section className="section pb-0">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
            {['Dresses', 'Sneakers', 'Accessories', 'Activewear'].map(cat => (
              <div key={cat} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)', textAlign: 'center', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                {cat}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">New Arrivals</h2>
          </div>
          
          {loading ? (
            <div className="product-grid">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 10 }}></div>)}
            </div>
          ) : (
            <div className="product-grid">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
