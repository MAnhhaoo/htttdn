import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Heart, ShoppingBag, User, Sun, Moon, Menu } from 'lucide-react';

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const { items } = useSelector(state => state.cart);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { wishlist } = useSelector(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    if (query) navigate(`/products?q=${query}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-light-card/95 dark:bg-dark-card/95 backdrop-blur-md border-b border-light-border dark:border-dark-border shadow-sm">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        
        {/* Mobile Menu Icon (Visible only on mobile) */}
        <button className="md:hidden text-light-text dark:text-dark-text p-2 -ml-2 hover:text-primary transition-colors">
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl font-black tracking-tighter text-primary">Miva</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input 
              type="text" 
              name="search"
              placeholder="Search for everything you need..." 
              className="w-full pl-5 pr-12 py-2.5 bg-gray-100 dark:bg-dark-bg border border-transparent focus:border-primary focus:bg-white dark:focus:bg-dark-card rounded-md text-sm outline-none transition-all text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted"
            />
            <button type="submit" className="absolute right-3 p-1.5 text-light-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5 sm:gap-6">
          <button onClick={toggleTheme} className="text-light-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary transition-colors">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <Link to="/account/wishlist" className="relative text-light-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary transition-colors hidden sm:block">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>
          
          <Link to="/cart" className="relative text-light-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>

          <div className="h-6 w-[1px] bg-light-border dark:bg-dark-border hidden sm:block"></div>

          {isAuthenticated ? (
            <Link to="/account/profile" className="flex items-center gap-2 text-light-text dark:text-dark-text hover:text-primary transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-semibold hidden lg:block">{user?.name || 'Account'}</span>
            </Link>
          ) : (
            <Link to="/login" className="flex items-center gap-2 text-light-text dark:text-dark-text hover:text-primary transition-colors">
              <User className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:block">Sign In</span>
            </Link>
          )}
        </div>
      </div>
      
      {/* Categories Nav */}
      <div className="border-t border-light-border dark:border-dark-border hidden md:block">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-8 text-sm font-medium">
          <Link to="/deals" className="text-red-600 dark:text-red-500 hover:opacity-80 transition-opacity font-bold">⚡ Flash Deals</Link>
          <Link to="/products?category=electronics" className="text-light-text dark:text-dark-text hover:text-primary transition-colors">Electronics</Link>
          <Link to="/products?category=fashion" className="text-light-text dark:text-dark-text hover:text-primary transition-colors">Fashion</Link>
          <Link to="/products?category=beauty" className="text-light-text dark:text-dark-text hover:text-primary transition-colors">Beauty</Link>
          <Link to="/products?category=home" className="text-light-text dark:text-dark-text hover:text-primary transition-colors">Home & Living</Link>
          <Link to="/products" className="text-light-muted dark:text-dark-muted hover:text-primary transition-colors ml-auto">All Categories</Link>
        </div>
      </div>
    </header>
  );
}
