import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import Button from '../../components/common/Button/Button';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { mockCategories } from '../../mock/categories.mock';

export default function ProductSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryQuery = searchParams.get('category') || '';
  const searchQuery = searchParams.get('q') || '';
  
  const { products, loading } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');

  // Filter Logic
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Category filter
    if (categoryQuery) {
      result = result.filter(p => p.category === categoryQuery);
    }

    // Sort Logic
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Mock sorting by newest (using id as a proxy)
        result.sort((a, b) => b.id - a.id);
        break;
      default: // relevance
        break;
    }

    setFilteredProducts(result);
  }, [products, categoryQuery, searchQuery, sortBy]);

  const handleCategoryClick = (catSlug) => {
    if (catSlug === categoryQuery) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catSlug);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
          {searchQuery ? `Search results for "${searchQuery}"` : categoryQuery ? `${categoryQuery.charAt(0).toUpperCase() + categoryQuery.slice(1)} Products` : 'All Products'}
        </h1>
        <p className="text-light-muted dark:text-dark-muted">
          Showing {filteredProducts.length} results
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filter (Desktop) */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-light-text dark:text-dark-text font-bold text-lg">
              <Filter className="w-5 h-5" /> Filters
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="font-semibold text-light-text dark:text-dark-text mb-4">Categories</h3>
              <ul className="space-y-3">
                {mockCategories.map(cat => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`text-sm hover:text-primary transition-colors ${categoryQuery === cat.slug ? 'text-primary font-bold' : 'text-light-muted dark:text-dark-muted'}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range (Mock UI) */}
            <div>
              <h3 className="font-semibold text-light-text dark:text-dark-text mb-4">Price Range</h3>
              <div className="flex items-center gap-2 mb-4">
                <input type="text" placeholder="Min" className="w-full p-2 border border-light-border dark:border-dark-border rounded text-sm bg-transparent outline-none focus:border-primary" />
                <span className="text-light-muted">-</span>
                <input type="text" placeholder="Max" className="w-full p-2 border border-light-border dark:border-dark-border rounded text-sm bg-transparent outline-none focus:border-primary" />
              </div>
              <Button variant="outline" className="w-full text-sm py-2">Apply</Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-gray-50 dark:bg-dark-bg p-4 rounded-xl border border-light-border dark:border-dark-border">
            <button className="lg:hidden flex items-center gap-2 text-sm font-semibold text-light-text dark:text-dark-text px-4 py-2 border rounded-lg bg-white dark:bg-dark-card">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            
            <div className="flex items-center gap-3 sm:ml-auto">
              <span className="text-sm text-light-muted dark:text-dark-muted hidden sm:block">Sort by:</span>
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white dark:bg-dark-card border border-light-border dark:border-dark-border text-light-text dark:text-dark-text text-sm rounded-lg pl-4 pr-10 py-2 outline-none focus:border-primary cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Best Rated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <Loading />
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-10">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {/* Pagination Mock */}
              <div className="flex justify-center mt-10">
                <div className="flex gap-2">
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-light-border dark:border-dark-border text-light-muted hover:text-primary hover:border-primary transition-all bg-white dark:bg-dark-card">1</button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold shadow-md">2</button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-light-border dark:border-dark-border text-light-muted hover:text-primary hover:border-primary transition-all bg-white dark:bg-dark-card">3</button>
                  <span className="w-10 h-10 flex items-center justify-center text-light-muted">...</span>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-light-border dark:border-dark-border py-20">
              <EmptyState 
                title="No products found" 
                description="Try adjusting your filters or searching for something else."
                actionText="Clear all filters"
                onAction={() => {
                  setSearchParams({});
                  setSortBy('relevance');
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

