'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function BeautyPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getCategory('beauty');
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
      <section className="section pb-0 pt-4">
        <div className="container">
          <div className="hero" style={{ background: '#FFE4E1', minHeight: '400px' }}>
            <div className="hero-content">
              <span className="hero-badge" style={{ background: '#FF69B4', color: 'white' }}>Beauty & Personal Care</span>
              <h1 style={{ fontSize: 'var(--text-4xl)', color: '#333' }}>Glow Naturally.</h1>
              <p style={{ color: '#666' }}>Premium skincare, makeup, and wellness products from top global brands.</p>
              <div className="hero-actions">
                <button className="btn btn-primary" style={{ background: '#FF69B4' }}>Shop Skincare</button>
              </div>
            </div>
            <div className="hero-image" style={{ width: '50%', right: '0', background: 'none' }}>
              <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800" alt="Beauty" style={{ objectFit: 'cover', opacity: 1, borderRadius: 'var(--radius-xl)' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Best of Beauty</h2>
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
