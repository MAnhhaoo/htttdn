import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, HeadphonesIcon, Gift } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import ProductCardSkeleton from '../../components/product/ProductCard/ProductCardSkeleton';

export default function Home() {
  const { products, isLoading: isLoadingProducts } = useProducts({ limit: 8 });
  const { categories, isLoading: isLoadingCategories } = useCategories();

  // Pick top 6 categories, or empty if loading
  const displayCategories = categories?.slice(0, 6) || [];

  return (
    <div className="pb-16 bg-light-bg dark:bg-dark-bg transition-colors duration-500">

      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-28 md:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent dark:from-primary/10 dark:via-dark-bg dark:to-dark-bg z-0"></div>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-10 lg:gap-16">

          <div className="flex-1 space-y-8 text-center md:text-left pt-8 md:pt-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs sm:text-sm font-semibold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Bộ sưu tập mới 2026
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-light-text dark:text-dark-text leading-[1.15]">
              Định hình <br className="hidden md:block" />
              <span className="text-primary italic pr-2">Phong cách</span> sống
            </h1>

            <p className="text-base sm:text-lg text-light-muted dark:text-dark-muted max-w-xl mx-auto md:mx-0 leading-relaxed font-light">
              Khám phá hàng ngàn sản phẩm chất lượng cao từ các thương hiệu uy tín. Trải nghiệm mua sắm đẳng cấp và tiện lợi ngay tại Miva.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
              <Link to="/products" className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-3">
                Khám phá ngay <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md md:max-w-none">
            {/* Geometric Hero Art instead of external image */}
            <div className="relative aspect-square md:aspect-[4/3] rounded-[2rem] overflow-hidden bg-gradient-to-tr from-light-surface to-white dark:from-dark-surface dark:to-dark-card border border-light-border dark:border-dark-border luxury-shadow flex items-center justify-center group">
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-700"></div>

              {/* Abstract shapes */}
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-primary/30 rounded-full blur-3xl animate-pulse delay-700"></div>

              <div className="relative z-10 flex flex-col items-center text-center p-8">
                <Sparkles className="w-16 h-16 text-primary mb-6" strokeWidth={1} />
                <h2 className="text-3xl font-serif font-bold text-light-text dark:text-dark-text mb-2 uppercase tracking-widest">Premium</h2>
                <p className="text-sm text-light-muted dark:text-dark-muted tracking-widest uppercase">Marketplace</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Trust / Benefits Section ── */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 -mt-16 md:-mt-24 mb-20">
        <div className="card-surface rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl dark:shadow-2xl flex flex-col md:flex-row gap-8 justify-between divide-y md:divide-y-0 md:divide-x divide-light-border dark:divide-dark-border">

          <div className="flex-1 flex flex-col items-center text-center px-4 pt-4 md:pt-0">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Chính hãng 100%</h3>
            <p className="text-sm text-light-muted dark:text-dark-muted">Đảm bảo nguồn gốc xuất xứ rõ ràng từ các nhà cung cấp uy tín.</p>
          </div>

          <div className="flex-1 flex flex-col items-center text-center px-4 pt-8 md:pt-0">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Giao hàng tốc hành</h3>
            <p className="text-sm text-light-muted dark:text-dark-muted">Nhận hàng nhanh chóng trên toàn quốc với dịch vụ cao cấp.</p>
          </div>

          <div className="flex-1 flex flex-col items-center text-center px-4 pt-8 md:pt-0">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <HeadphonesIcon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Hỗ trợ 24/7</h3>
            <p className="text-sm text-light-muted dark:text-dark-muted">Đội ngũ chăm sóc khách hàng luôn sẵn sàng phục vụ bạn.</p>
          </div>

        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-12 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-2">Danh mục nổi bật</h2>
          </div>
        </div>

        {isLoadingCategories ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-light-surface dark:bg-dark-surface rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {displayCategories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="group flex flex-col items-center justify-center p-6 card-surface rounded-2xl hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-full bg-light-surface dark:bg-dark-surface text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 flex items-center justify-center mb-4">
                  <Gift className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-light-text dark:text-dark-text text-center text-sm truncate w-full">{category.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Featured Products ── */}
      <section className="py-12 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-2">Các sản phẩm mua nhiều nhất</h2>
            <p className="text-light-muted dark:text-dark-muted font-light hidden sm:block">Những sản phẩm được khách hàng yêu thích và săn đón.</p>
          </div>
          <Link to="/products" className="text-primary font-semibold hover:text-primary-dark transition-colors flex items-center gap-2 group whitespace-nowrap">
            Xem tất cả <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {isLoadingProducts ? (
            [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center card-surface border-dashed rounded-3xl">
              <p className="text-light-muted dark:text-dark-muted">Chưa có sản phẩm nào.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
