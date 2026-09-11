'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function CategoryPage({ params }) {
  const { slug } = params;
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [sort, setSort] = useState('popular');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getCategory(slug);
        if (res.success) {
          setCategory(res.data);
          let sortedProducts = [...res.data.products];
          
          switch (sort) {
            case 'price_asc': sortedProducts.sort((a, b) => a.price - b.price); break;
            case 'price_desc': sortedProducts.sort((a, b) => b.price - a.price); break;
            case 'rating': sortedProducts.sort((a, b) => b.rating - a.rating); break;
            case 'newest': sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
            case 'popular': default: sortedProducts.sort((a, b) => b.soldCount - a.soldCount); break;
          }
          
          setProducts(sortedProducts);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, sort]);

  if (loading) {
    return (
      <div className="container section">
        <div className="skeleton" style={{ height: 160, borderRadius: 20, marginBottom: 40 }}></div>
        <div className="product-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <div key={i} className="skeleton" style={{ height: 320, borderRadius: 10 }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="error-page">
        <div className="error-code">404</div>
        <h1>Category Not Found</h1>
        <p>The category you're looking for doesn't exist.</p>
        <Link href="/products" className="btn btn-primary">Browse All Products</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link href="/products">Categories</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{category.name}</span>
      </div>

      {/* Category Header */}
      <div className="hero" style={{ minHeight: '240px', marginBottom: 'var(--space-10)', background: 'linear-gradient(45deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
        <div className="hero-content" style={{ padding: 'var(--space-10)' }}>
          <h1 style={{ color: 'var(--text-primary)', fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-3)' }}>{category.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{category.description}</p>
        </div>
        {category.image && (
          <div className="hero-image" style={{ width: '40%', opacity: 1, background: 'none' }}>
            <img src={category.image} alt={category.name} style={{ objectFit: 'contain', padding: 'var(--space-6)' }} />
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="sort-toolbar">
        <div className="sort-info">
          Showing <strong>{products.length}</strong> products
        </div>
        <div className="sort-controls">
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Sort by:</span>
          <select 
            className="sort-select" 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="popular">Popularity</option>
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="product-grid">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No products yet</h3>
          <p>Check back later for new {category.name.toLowerCase()}.</p>
        </div>
      )}
    </div>
  );
}
