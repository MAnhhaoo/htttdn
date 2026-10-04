import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, ChevronRight, ChevronDown, ArrowRight, Bell, Heart } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useCart } from '../../../hooks/useCart';
import { useCategories } from '../../../hooks/useCategories';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { categories } = useCategories();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    if (query) {
      navigate(`/products?q=${query}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* ── Top Announcement Bar ── */}
      <div className="bg-[#1A3A2C] text-white text-xs sm:text-sm font-medium py-2.5 text-center flex items-center justify-center gap-2">
        <span className="opacity-90">Miễn phí vận chuyển cho đơn hàng từ 499K</span>
        <Link to="/products" className="hover:underline flex items-center gap-1 font-bold">
          Khám phá ngay <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 dark:bg-dark-card/90 backdrop-blur-xl border-b border-light-border dark:border-dark-border shadow-sm transition-colors duration-500">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-6">

          {/* Mobile Menu Button & Logo */}
          <div className="flex items-center gap-3">
            <button
              className="p-1.5 -ml-1.5 lg:hidden text-light-text dark:text-dark-text hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-black tracking-[0.2em] text-[#1A3A2C] dark:text-white font-sans mt-1 uppercase">MIVA</span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="flex-1 max-w-2xl hidden lg:block">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <input
                type="text"
                name="search"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-5 pr-12 py-2.5 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border focus:border-primary focus:bg-white dark:focus:bg-dark-card rounded-full text-sm outline-none transition-all text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted"
              />
              <button type="submit" className="absolute right-3 p-1.5 text-light-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />

            <Link to="#" className="relative p-2 text-light-muted dark:text-dark-muted hover:text-[#1A3A2C] dark:hover:text-primary transition-colors">
              <Bell className="w-5 h-5 text-[#1A3A2C] dark:text-white" strokeWidth={2.5} />
              <span className="absolute 0 top-0.5 right-0.5 w-4 h-4 bg-[#c26d53] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#FAF7F2] dark:border-dark-card">
                3
              </span>
            </Link>

            <Link to="#" className="p-2 text-light-muted dark:text-dark-muted hover:text-[#1A3A2C] dark:hover:text-primary transition-colors">
              <Heart className="w-5 h-5 text-[#1A3A2C] dark:text-white" strokeWidth={2.5} />
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/orders" className="text-sm font-medium text-light-muted hover:text-primary transition-colors hidden sm:block">
                  Đơn hàng
                </Link>
                <Link to="/profile" className="flex items-center gap-2 text-[#1A3A2C] dark:text-dark-text hover:text-primary transition-colors p-2">
                  <User className="w-5 h-5" strokeWidth={2.5} />
                  <span className="text-sm font-medium hidden sm:block truncate max-w-[120px]">{user?.fullName?.split(' ').pop()}</span>
                </Link>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 text-[#1A3A2C] dark:text-dark-text hover:text-primary transition-colors p-2">
                <User className="w-5 h-5" strokeWidth={2.5} />
              </Link>
            )}

            <Link to="/cart" className="relative p-2 text-light-muted dark:text-dark-muted hover:text-[#1A3A2C] dark:hover:text-primary transition-colors">
              <ShoppingBag className="w-5 h-5 text-[#1A3A2C] dark:text-white" strokeWidth={2.5} />
              {isAuthenticated && totalItems > 0 && (
                <span className="absolute 0 top-0.5 right-0.5 w-4 h-4 bg-[#1A3A2C] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#FAF7F2] dark:border-dark-card">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Desktop Categories Nav */}
        <div className="hidden lg:flex justify-center mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-5 pt-1">
          <div className="bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-md border border-light-border dark:border-dark-border text-light-text dark:text-dark-text px-8 py-2.5 rounded-full flex items-center gap-6 text-[13px] font-bold tracking-wider shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <Link to="/products" className="hover:text-primary transition-colors whitespace-nowrap uppercase">
              Tất cả sản phẩm
            </Link>
            <div className="w-1 h-1 rounded-full bg-light-border dark:bg-dark-border"></div>
            
            {/* Danh mục Dropdown */}
            <div className="relative group">
              <button className="hover:text-primary transition-colors whitespace-nowrap uppercase flex items-center gap-1">
                Danh mục
                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 w-56">
                <div className="bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-md rounded-2xl shadow-xl border border-light-border dark:border-dark-border overflow-hidden py-2 flex flex-col">
                  {categories?.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.slug}`}
                      className="px-5 py-2.5 hover:bg-light-bg dark:hover:bg-dark-bg text-light-text dark:text-dark-text hover:text-primary dark:hover:text-primary transition-colors text-xs font-bold tracking-wider whitespace-nowrap uppercase text-left"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  {(!categories || categories.length === 0) && (
                    <div className="px-5 py-3 text-xs text-light-muted text-center uppercase font-bold">Không có danh mục</div>
                  )}
                </div>
              </div>
            </div>
            <div className="w-1 h-1 rounded-full bg-light-border dark:bg-dark-border"></div>
            <Link to={`/products?createdAfter=${new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()}`} className="hover:text-primary transition-colors whitespace-nowrap uppercase">
              Sản phẩm mới
            </Link>
            <div className="w-1 h-1 rounded-full bg-light-border dark:bg-dark-border"></div>
            <Link to="/products?sale=true" className="hover:text-primary transition-colors whitespace-nowrap uppercase text-red-500">
              Khuyến mãi
            </Link>
            <div className="w-1 h-1 rounded-full bg-light-border dark:bg-dark-border"></div>
            <Link to="/about" className="hover:text-primary transition-colors whitespace-nowrap uppercase">
              Về MIVA
            </Link>
            <div className="w-1 h-1 rounded-full bg-light-border dark:bg-dark-border"></div>
            <Link to="/contact" className="hover:text-primary transition-colors whitespace-nowrap uppercase">
              Liên hệ
            </Link>
          </div>
        </div>
      </header>

      {/* ── Mobile Navigation Drawer ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-dark-card shadow-2xl flex flex-col animate-slide-in-left">
            <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
              <span className="text-2xl font-black tracking-tighter text-primary font-serif uppercase mt-1">Miva</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-light-muted hover:text-light-text dark:text-dark-muted dark:hover:text-dark-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Mobile Search */}
              <div className="p-4 border-b border-light-border dark:border-dark-border bg-light-surface/50 dark:bg-dark-surface/50">
                <form onSubmit={handleSearch} className="relative flex items-center">
                  <input
                    type="text"
                    name="search"
                    placeholder="Tìm kiếm..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border focus:border-primary rounded-xl text-sm outline-none transition-all text-light-text dark:text-dark-text"
                  />
                  <Search className="w-4 h-4 text-light-muted dark:text-dark-muted absolute left-3.5" />
                </form>
              </div>

              {/* Mobile User/Auth Menu */}
              <div className="p-4 border-b border-light-border dark:border-dark-border">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2 py-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {user?.fullName?.charAt(0) || <User className="w-5 h-5" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-light-text dark:text-dark-text">{user?.fullName}</span>
                        <span className="text-xs text-light-muted dark:text-dark-muted">{user?.email}</span>
                      </div>
                    </div>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-light-surface dark:hover:bg-dark-surface text-light-text dark:text-dark-text font-medium transition-colors">
                      <User className="w-5 h-5 text-light-muted dark:text-dark-muted" /> Tài khoản của tôi
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-light-surface dark:hover:bg-dark-surface text-light-text dark:text-dark-text font-medium transition-colors">
                      <ShoppingBag className="w-5 h-5 text-light-muted dark:text-dark-muted" /> Đơn mua
                    </Link>
                  </div>
                ) : (
                  <Link to="/login" className="flex items-center justify-center w-full py-3 bg-primary text-white rounded-xl font-bold">
                    Đăng nhập / Đăng ký
                  </Link>
                )}
              </div>

              {/* Mobile Categories */}
              <div className="p-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-light-muted dark:text-dark-muted mb-2 px-2">
                  Danh mục
                </h4>
                <div className="space-y-1">
                  <Link to="/products" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-light-surface dark:hover:bg-dark-surface text-light-text dark:text-dark-text font-medium transition-colors">
                    Tất cả sản phẩm <ChevronRight className="w-4 h-4 text-light-muted" />
                  </Link>
                  {categories?.map(cat => (
                    <Link key={cat.id} to={`/products?category=${cat.slug}`} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-light-surface dark:hover:bg-dark-surface text-light-muted dark:text-dark-muted hover:text-primary transition-colors">
                      {cat.name} <ChevronRight className="w-4 h-4 text-light-muted opacity-50" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Footer Links */}
              <div className="p-4 border-t border-light-border dark:border-dark-border">
                <div className="space-y-1">
                  <Link to="/about" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-light-surface dark:hover:bg-dark-surface text-light-muted dark:text-dark-muted hover:text-primary transition-colors">
                    Về MIVA
                  </Link>
                  <Link to="/contact" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-light-surface dark:hover:bg-dark-surface text-light-muted dark:text-dark-muted hover:text-primary transition-colors">
                    Liên hệ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-in animation for left drawer */}
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
