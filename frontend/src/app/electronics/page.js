'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function ElectronicsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getCategory('electronics');
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
      {/* Electronics Hero Banner */}
      <section className="section pb-0 pt-4">
        <div className="container">
          <div className="hero" style={{ background: '#0D0D0D', minHeight: '400px' }}>
            <div className="hero-content">
              <span className="hero-badge" style={{ background: '#2997FF', color: 'white' }}>Tech Mall</span>
              <h1 style={{ fontSize: 'var(--text-4xl)' }}>Next-Gen Tech.</h1>
              <p>Discover the latest smartphones, laptops, and premium audio equipment from world-leading brands.</p>
              <div className="hero-actions">
                <button className="btn btn-primary" style={{ background: '#2997FF' }}>Shop Apple</button>
                <button className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>View Deals</button>
              </div>
            </div>
            <div className="hero-image" style={{ width: '45%', right: '5%' }}>
              <img src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800" alt="Electronics Mall" style={{ objectFit: 'contain', opacity: 0.8 }} />
            </div>
          </div>
        </div>
      </section>

      {/* Top Brands */}
      <section className="section pb-0">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Top Brands</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--space-4)' }}>
            {['Apple', 'Samsung', 'Sony', 'Bose', 'Dell', 'Asus'].map(brand => (
              <div key={brand} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', textAlign: 'center', fontWeight: 600 }}>
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">All Electronics</h2>
            <div className="sort-controls">
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Sort by:</span>
              <select className="sort-select">
                <option value="popular">Popularity</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="product-grid">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 10 }}></div>)}
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
