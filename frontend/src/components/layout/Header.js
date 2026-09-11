'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { count: cartCount, fetchCart } = useCart();
  const { count: wishCount, fetchWishlist } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setUserDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSuggestions(null); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.success) setSuggestions(data.data);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const popularSearches = ['iPhone', 'MacBook', 'Nike', 'Headphones', 'Watch', 'Skincare'];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-top">
            {/* Mobile hamburger */}
            <button className="header-action-btn" onClick={() => setMobileMenuOpen(true)} style={{ display: 'none' }} id="mobile-menu-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>

            {/* Logo */}
            <Link href="/" className="logo">
              <span>MI<span className="logo-accent">VA</span></span>
              <span className="logo-tagline">Everything You Need</span>
            </Link>

            {/* Search Bar */}
            <div className="search-wrapper" ref={searchRef}>
              <form className="search-bar" onSubmit={handleSearch}>
                <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  type="text"
                  placeholder="Search for products, brands, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  id="search-input"
                  aria-label="Search products"
                />
                <button type="submit" className="search-btn">Search</button>
              </form>

              {searchOpen && (
                <div className="search-overlay active">
                  {!searchQuery.trim() ? (
                    <>
                      <div className="search-overlay-section">
                        <div className="search-overlay-label">Popular Searches</div>
                        <div>
                          {popularSearches.map(term => (
                            <span key={term} className="search-tag" onClick={() => { setSearchQuery(term); window.location.href = `/products?search=${term}`; }}>{term}</span>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : suggestions ? (
                    <>
                      {suggestions.products?.length > 0 && (
                        <div className="search-overlay-section">
                          <div className="search-overlay-label">Products</div>
                          {suggestions.products.map(p => (
                            <Link key={p.id} href={`/products/${p.id}`} className="search-suggestion-item" onClick={() => setSearchOpen(false)}>
                              <img src={p.image} alt={p.name} />
                              <div>
                                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{p.name}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gold)', fontWeight: 700 }}>${p.price}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      {suggestions.categories?.length > 0 && (
                        <div className="search-overlay-section">
                          <div className="search-overlay-label">Categories</div>
                          {suggestions.categories.map(c => (
                            <Link key={c.id} href={`/category/${c.slug}`} className="search-suggestion-item" onClick={() => setSearchOpen(false)}>
                              <span>{c.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {/* Header Actions */}
            <div className="header-actions">
              <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" id="theme-toggle">
                {theme === 'light' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                )}
              </button>

              <Link href="/account/wishlist" className="header-action-btn" aria-label="Wishlist" id="wishlist-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                {wishCount > 0 && <span className="badge">{wishCount}</span>}
              </Link>

              <Link href="/cart" className="header-action-btn" aria-label="Shopping Cart" id="cart-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>

              {/* User Dropdown */}
              <div className="user-dropdown" ref={dropdownRef}>
                <button className="header-action-btn" onClick={() => setUserDropdown(!userDropdown)} aria-label="Account" id="account-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </button>
                <div className={`dropdown-menu ${userDropdown ? 'active' : ''}`}>
                  <Link href="/account" className="dropdown-item" onClick={() => setUserDropdown(false)}>👤 My Profile</Link>
                  <Link href="/account/orders" className="dropdown-item" onClick={() => setUserDropdown(false)}>📦 My Orders</Link>
                  <Link href="/account/wishlist" className="dropdown-item" onClick={() => setUserDropdown(false)}>❤️ Wishlist</Link>
                  <Link href="/account/vouchers" className="dropdown-item" onClick={() => setUserDropdown(false)}>🎟️ My Vouchers</Link>
                  <div className="dropdown-divider" />
                  <Link href="/account/settings" className="dropdown-item" onClick={() => setUserDropdown(false)}>⚙️ Settings</Link>
                  <Link href="/login" className="dropdown-item" onClick={() => setUserDropdown(false)}>🔑 Login / Register</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="nav-bar" aria-label="Main navigation">
            <Link href="/" className="nav-link active">Home</Link>
            <Link href="/products" className="nav-link">Products</Link>
            <Link href="/deals" className="nav-link" style={{ color: 'var(--error)' }}>🔥 Deals</Link>
            <Link href="/electronics" className={`nav-link ${pathname === '/electronics' ? 'active' : ''}`}>Electronics</Link>
            <Link href="/fashion" className={`nav-link ${pathname === '/fashion' ? 'active' : ''}`}>Fashion</Link>
            <Link href="/beauty" className={`nav-link ${pathname === '/beauty' ? 'active' : ''}`}>Beauty</Link>
            <Link href="/home-living" className={`nav-link ${pathname === '/home-living' ? 'active' : ''}`}>Home & Living</Link>
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && <div className="modal-overlay" onClick={() => setMobileMenuOpen(false)} />}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <span className="logo">MI<span className="logo-accent">VA</span></span>
          <button onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="mobile-menu-links">
          {[
            { href: '/', label: '🏠 Home' },
            { href: '/products', label: '🛍️ Products' },
            { href: '/deals', label: '🔥 Deals' },
            { href: '/electronics', label: '💻 Electronics' },
            { href: '/fashion', label: '👗 Fashion' },
            { href: '/beauty', label: '✨ Beauty' },
            { href: '/home-living', label: '🏠 Home & Living' },
            { href: '/about', label: '📖 About' },
            { href: '/contact', label: '📧 Contact' },
            { href: '/faq', label: '❓ FAQ' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <div className="mobile-nav-items">
          <Link href="/" className="mobile-nav-item active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            Home
          </Link>
          <Link href="/products" className="mobile-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Categories
          </Link>
          <Link href="/products" className="mobile-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search
          </Link>
          <Link href="/cart" className="mobile-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18"/></svg>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
            Cart
          </Link>
          <Link href="/account" className="mobile-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Account
          </Link>
        </div>
      </nav>

      <style jsx>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
