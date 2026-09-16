import { Link } from 'react-router-dom';
import { useProducts, useFlashDeals } from '../../hooks/useProducts';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import Button from '../../components/common/Button/Button';
import Loading from '../../components/common/Loading/Loading';
import { mockCategories } from '../../mock/categories.mock';
import { ArrowRight, Clock, ShieldCheck, Star, Truck, RefreshCw, Send } from 'lucide-react';

export default function Home() {
  const { products, loading: productsLoading } = useProducts();
  const { deals, loading: dealsLoading } = useFlashDeals();

  if (productsLoading || dealsLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="flex flex-col gap-20 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-r from-light-bg to-primary-light/20 dark:from-dark-bg dark:to-primary-dark/20 pt-8 pb-16 border-b border-light-border dark:border-dark-border">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <h1 className="text-5xl lg:text-7xl font-black text-light-text dark:text-dark-text tracking-tight leading-tight">
                Everything <br />
                <span className="text-primary">You Need.</span>
              </h1>
              <p className="text-lg text-light-muted dark:text-dark-muted max-w-lg leading-relaxed">
                Discover premium products, trusted sellers, and everyday essentials in one place. Experience luxury shopping at your fingertips.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Button variant="primary" className="px-8 py-4 text-base">Shop Now</Button>
                <Button variant="outline" className="px-8 py-4 text-base">Explore Deals</Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-luxury">
                <img 
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop" 
                  alt="Premium Shopping" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-dark-card p-6 rounded-xl shadow-luxury-dark border border-light-border dark:border-dark-border hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Star className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <p className="font-bold text-light-text dark:text-dark-text">4.9/5 Rating</p>
                    <p className="text-sm text-light-muted dark:text-dark-muted">from 10k+ reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES */}
      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-10">
          <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">Shop by Category</h2>
          <p className="text-light-muted dark:text-dark-muted">Find everything you need in one place.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mockCategories.map(category => (
            <Link 
              key={category.id} 
              to={`/products?category=${category.slug}`}
              className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl hover:border-primary hover:shadow-luxury transition-all group"
            >
              <div className="text-4xl group-hover:scale-110 transition-transform">{category.icon}</div>
              <span className="font-semibold text-sm text-light-text dark:text-dark-text group-hover:text-primary transition-colors">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FLASH DEALS */}
      <section className="bg-red-50 dark:bg-red-950/10 py-16">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
                <Clock className="w-8 h-8" /> Flash Deals
              </h2>
              <div className="flex items-center gap-2 text-red-600 dark:text-red-500 font-mono text-xl font-bold bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-lg">
                <span>02</span>:<span>14</span>:<span>35</span>
              </div>
            </div>
            <Link to="/deals" className="text-red-600 dark:text-red-500 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View All Deals <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
            {deals.slice(0, 5).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">Featured Products</h2>
            <p className="text-light-muted dark:text-dark-muted">Discover products selected for quality and style.</p>
          </div>
          <Link to="/products" className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {products.slice(0, 5).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. PROMOTION BANNER */}
      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-dark-bg text-white">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1600&auto=format&fit=crop" 
            alt="Promotion" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 flex flex-col items-center justify-center py-24 px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Upgrade Your Everyday.</h2>
            <p className="text-lg text-gray-200 mb-8 max-w-xl">
              Discover products selected for quality, comfort, and style.
            </p>
            <Button variant="primary" className="px-8 py-4">Explore Collection</Button>
          </div>
        </div>
      </section>

      {/* 6. RECOMMENDED PRODUCTS */}
      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">Recommended For You</h2>
          <p className="text-light-muted dark:text-dark-muted">Products you may like.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {products.slice(0, 10).map(product => (
            <ProductCard key={`rec-${product.id}`} product={product} />
          ))}
        </div>
      </section>

      {/* 7. WHY MIVA */}
      <section className="bg-gray-50 dark:bg-dark-card/50 py-16 border-y border-light-border dark:border-dark-border">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-light-text dark:text-dark-text text-center mb-12">Why Shop With Miva?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white dark:bg-dark-bg rounded-full flex items-center justify-center text-primary mb-4 shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Secure Shopping</h3>
              <p className="text-sm text-light-muted dark:text-dark-muted">100% secure payment processing and buyer protection.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white dark:bg-dark-bg rounded-full flex items-center justify-center text-primary mb-4 shadow-sm">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Trusted Sellers</h3>
              <p className="text-sm text-light-muted dark:text-dark-muted">All sellers are verified to ensure quality and authenticity.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white dark:bg-dark-bg rounded-full flex items-center justify-center text-primary mb-4 shadow-sm">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Fast Delivery</h3>
              <p className="text-sm text-light-muted dark:text-dark-muted">Express shipping options available worldwide.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white dark:bg-dark-bg rounded-full flex items-center justify-center text-primary mb-4 shadow-sm">
                <RefreshCw className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Easy Returns</h3>
              <p className="text-sm text-light-muted dark:text-dark-muted">30-day hassle-free return policy for all items.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. NEWSLETTER */}
      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="bg-primary/10 dark:bg-primary-dark/10 rounded-2xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-md text-center md:text-left">
            <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">Stay in the know.</h2>
            <p className="text-light-muted dark:text-dark-muted">
              Get exclusive offers, new arrivals, and Miva updates delivered directly to your inbox.
            </p>
          </div>
          <form className="w-full max-w-md relative" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="w-full pl-6 pr-32 py-4 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl outline-none focus:border-primary shadow-sm"
            />
            <Button variant="primary" className="absolute right-2 top-2 bottom-2 rounded-lg px-6">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

    </div>
  );
}
