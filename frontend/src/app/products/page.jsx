'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const searchQ = searchParams.get('search') || '';
  
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('popular');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const cats = await api.getCategories();
        setCategories(cats.data || []);
      } catch (e) {}
    }
    load();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const params = {
          search: searchQ,
          category,
          sort,
          limit: 20
        };
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;

        const res = await api.getProducts(params);
        setProducts(res.data?.items || []);
        setTotal(res.data?.total || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [searchQ, category, sort, minPrice, maxPrice]);

  return (
    <div className="container section">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a href="/">Home</a>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{searchQ ? `Search: "${searchQ}"` : 'All Products'}</span>
      </div>

      <div className="account-layout" style={{ paddingTop: 'var(--space-2)' }}>
        {/* Sidebar Filters */}
        <div className="filter-sidebar">
          <div className="filter-section">
            <h3 className="filter-title">Categories</h3>
            <div className={`filter-option ${category === '' ? 'active' : ''}`} onClick={() => setCategory('')}>
              <span style={{ fontWeight: category === '' ? 'bold' : 'normal' }}>All Categories</span>
            </div>
            {categories.map(cat => (
              <div 
                key={cat.id} 
                className="filter-option"
                onClick={() => setCategory(cat.id)}
              >
                <span style={{ fontWeight: category === cat.id ? 'bold' : 'normal' }}>{cat.name}</span>
              </div>
            ))}
          </div>

          <div className="filter-section">
            <h3 className="filter-title">Price Range</h3>
            <div className="price-range">
              <input 
                type="number" 
                className="form-input" 
                placeholder="Min" 
                value={minPrice} 
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span>-</span>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Max" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="account-content">
          <div className="sort-toolbar">
            <div className="sort-info">
              Showing <strong>{products.length}</strong> of <strong>{total}</strong> products
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

          {loading ? (
            <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="skeleton" style={{ height: 320, borderRadius: 10 }}></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {products.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              
              {/* Pagination */}
              {total > products.length && (
                <div className="pagination">
                  <button className="page-btn active">1</button>
                  <button className="page-btn">2</button>
                  <button className="page-btn">3</button>
                  <button className="page-btn">&raquo;</button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No products found</h3>
              <p>We couldn't find any products matching your search or filters. Try using different keywords or removing filters.</p>
              <button className="btn btn-primary" onClick={() => { setCategory(''); setMinPrice(''); setMaxPrice(''); setSort('popular'); }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
