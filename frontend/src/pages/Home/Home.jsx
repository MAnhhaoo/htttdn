import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, HeadphonesIcon, Gift, MoveRight } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import ProductCardSkeleton from '../../components/product/ProductCard/ProductCardSkeleton';

export default function Home() {
  const { products, isLoading: isLoadingProducts } = useProducts({ limit: 4 });
  const { categories, isLoading: isLoadingCategories } = useCategories();

  // Pick top 4 categories
  const displayCategories = categories?.slice(0, 4) || [];

  const categoryBgColors = [
    'bg-[#E2F2E9]', // Mint
    'bg-[#E5EEF2]', // Blue
    'bg-[#F5E6DA]', // Peach
    'bg-[#F2EDCE]', // Yellow
  ];

  return (
    <div className="bg-[#FAF7F2] dark:bg-dark-bg transition-colors duration-500 w-full overflow-hidden">
      {/* ── Hero Banner ── */}
      <section className="relative w-full">
        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#E2F2E9] rounded-bl-[100px] z-0 hidden md:block"></div>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center pt-16 pb-20 md:py-24">
          
          {/* Left Text */}
          <div className="flex-1 space-y-6 text-center md:text-left pr-0 md:pr-10">
            <div className="inline-flex items-center gap-2 text-[#2A5C4A] text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-4 h-4" />
              Lựa chọn mới cho mỗi ngày
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif text-[#1A3A2C] dark:text-dark-text leading-tight tracking-tight">
              Everything<br />
              <span className="italic text-[#2A5C4A]">You Need.</span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-dark-muted max-w-md mx-auto md:mx-0 leading-relaxed pt-2 pb-4">
              Từ những món đồ thiết yếu đến những điều bạn yêu thích — tất cả được tuyển chọn tại MIVA.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 pt-2 justify-center md:justify-start items-center">
              <Link to="/products" className="bg-[#1A3A2C] hover:bg-[#2A5C4A] text-white px-8 py-4 font-semibold transition-colors flex items-center justify-center gap-2 rounded-sm">
                Mua sắm ngay <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/products" className="text-[#1A3A2C] font-semibold hover:underline decoration-2 underline-offset-4 rounded-sm">
                Xem bộ sưu tập
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1 w-full mt-16 md:mt-0 relative flex justify-center">
            {/* Circle image container */}
            <div className="relative w-[300px] h-[400px] md:w-[450px] md:h-[550px] bg-[#E8DCD0] rounded-t-full overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1511511450040-677116ff389e?q=80&w=1473&auto=format&fit=crop" 
                alt="Miva Lifestyle" 
                className="w-full h-full object-cover object-center opacity-90"
              />
            </div>
            
            {/* Floating badge */}
            <div className="absolute top-10 -left-10 md:-left-16 bg-white p-4 py-3 shadow-lg flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E2F2E9] text-[#2A5C4A] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs text-gray-500">Sản phẩm mới</span>
                <span className="font-bold text-[#1A3A2C]">Mỗi tuần</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-16 md:py-24 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-[#2A5C4A] text-xs font-bold tracking-widest uppercase mb-2">Khám phá</div>
            <h2 className="text-4xl md:text-5xl font-serif text-[#1A3A2C] dark:text-dark-text tracking-tight">Mua sắm theo danh mục</h2>
          </div>
          <Link to="/products" className="text-[#2A5C4A] font-semibold hover:text-[#1A3A2C] transition-colors flex items-center gap-2 group whitespace-nowrap">
            Xem tất cả <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoadingCategories ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-dark-surface animate-pulse rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayCategories.map((category, index) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className={`group relative overflow-hidden flex flex-col justify-between p-8 ${categoryBgColors[index % 4]} transition-transform duration-300 hover:-translate-y-1 h-80 lg:h-96`}
              >
                <div className="z-10">
                  <p className="text-gray-500 text-xs mb-1">100+ sản phẩm</p>
                  <h3 className="text-2xl text-[#1A3A2C] font-serif tracking-tight">{category.name}</h3>
                  <div className="w-10 h-10 mt-6 rounded-full bg-white flex items-center justify-center text-[#1A3A2C] group-hover:bg-[#1A3A2C] group-hover:text-white transition-colors shadow-sm">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
                
                {/* Decorative curve */}
                <div className="absolute bottom-0 right-0 w-3/4 h-1/2 bg-black/5 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110 duration-500"></div>
                
                {/* Generic placeholder image per category for aesthetics */}
                <div className="absolute bottom-0 right-0 w-48 h-48 opacity-80 mix-blend-multiply rounded-tl-full overflow-hidden flex items-end justify-end">
                   <div className="w-40 h-40 bg-black/10 rounded-full translate-x-10 translate-y-10"></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Featured Products ── */}
      <section className="py-16 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-[#2A5C4A] text-xs font-bold tracking-widest uppercase mb-2">Được yêu thích</div>
            <h2 className="text-4xl md:text-5xl font-serif text-[#1A3A2C] dark:text-dark-text tracking-tight">Sản phẩm nổi bật</h2>
          </div>
          <Link to="/products" className="text-[#2A5C4A] font-semibold hover:text-[#1A3A2C] transition-colors flex items-center gap-2 group whitespace-nowrap">
            Xem tất cả <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {isLoadingProducts ? (
            [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-dashed border-2 border-gray-200">
              <p className="text-gray-500">Chưa có sản phẩm nào.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Member Promotion Banner ── */}
      <section className="py-16 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="w-full bg-[#1A3A2C] overflow-hidden relative flex flex-col md:flex-row items-center">
          
          <div className="flex-1 p-10 md:p-16 relative z-10">
            <div className="text-white/70 text-xs font-bold tracking-widest uppercase mb-4">Đặc quyền thành viên</div>
            <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight mb-6">
              Thêm niềm vui,<br/>
              <span className="italic opacity-90">thêm ưu đãi.</span>
            </h2>
            <p className="text-white/80 max-w-md leading-relaxed mb-8 font-light">
              Đăng ký thành viên MIVA để nhận ngay ưu đãi 15% cho đơn hàng đầu tiên và nhiều đặc quyền hấp dẫn.
            </p>
            <Link to="/login" className="inline-flex bg-white hover:bg-gray-100 text-[#1A3A2C] px-8 py-4 font-bold transition-colors items-center justify-center gap-3">
              Đăng ký ngay <MoveRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="flex-1 w-full h-64 md:h-full relative overflow-hidden flex items-center justify-center min-h-[300px]">
            {/* Outline circles */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 border-[1px] border-white/20 rounded-full"></div>
            {/* Main discount circle */}
            <div className="relative z-10 w-64 h-64 md:w-80 md:h-80 bg-[#C99C53] rounded-full flex flex-col items-center justify-center text-[#1A3A2C]">
              <span className="text-7xl md:text-8xl font-black tracking-tighter leading-none">15<span className="text-4xl md:text-5xl">%</span></span>
              <span className="text-2xl md:text-3xl font-bold tracking-widest mt-2">OFF</span>
            </div>
          </div>
          
        </div>
      </section>

    </div>
  );
}
