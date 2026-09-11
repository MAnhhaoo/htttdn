'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function HomeLivingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getCategory('home-living');
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
          <div className="hero" style={{ background: '#EAE6DF', minHeight: '400px' }}>
            <div className="hero-content">
              <span className="hero-badge" style={{ background: '#8B4513', color: 'white' }}>Home Design</span>
              <h1 style={{ fontSize: 'var(--text-4xl)', color: '#333' }}>Living Spaces.</h1>
              <p style={{ color: '#666' }}>Transform your home with our curated collection of furniture, decor, and smart home appliances.</p>
              <div className="hero-actions">
                <button className="btn btn-primary" style={{ background: '#8B4513' }}>Shop Furniture</button>
              </div>
            </div>
            <div className="hero-image" style={{ width: '50%', right: '0', background: 'none' }}>
              <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800" alt="Home and Living" style={{ objectFit: 'cover', opacity: 1, borderRadius: 'var(--radius-xl)' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Elevate Your Home</h2>
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
