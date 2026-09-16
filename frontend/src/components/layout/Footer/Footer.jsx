import { Link } from 'react-router-dom';
import { Globe, Mail, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-dark-card border-t border-light-border dark:border-dark-border">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <span className="text-4xl font-black tracking-tighter text-primary">Miva</span>
            </Link>
            <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed mb-6">
              Everything You Need. <br/>
              A premium marketplace for your everyday luxury and convenience.
            </p>
            <div className="flex items-center gap-4 text-light-muted dark:text-dark-muted">
              <a href="#" className="hover:text-primary transition-colors"><Globe className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Mail className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><MessageCircle className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-light-text dark:text-dark-text tracking-wide uppercase text-xs">Shop</h4>
            <ul className="space-y-4 text-sm text-light-muted dark:text-dark-muted">
              <li><Link to="/deals" className="hover:text-primary transition-colors">Flash Deals</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link to="/products?category=electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=fashion" className="hover:text-primary transition-colors">Fashion</Link></li>
              <li><Link to="/products?category=beauty" className="hover:text-primary transition-colors">Beauty</Link></li>
              <li><Link to="/products?category=home" className="hover:text-primary transition-colors">Home & Living</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-light-text dark:text-dark-text tracking-wide uppercase text-xs">Customer Service</h4>
            <ul className="space-y-4 text-sm text-light-muted dark:text-dark-muted">
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-light-text dark:text-dark-text tracking-wide uppercase text-xs">About Miva</h4>
            <ul className="space-y-4 text-sm text-light-muted dark:text-dark-muted">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="font-bold mb-6 text-light-text dark:text-dark-text tracking-wide uppercase text-xs">Newsletter</h4>
            <p className="text-sm text-light-muted dark:text-dark-muted mb-4">
              Get exclusive offers, new arrivals, and Miva updates.
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-light-border dark:border-dark-border focus:border-primary rounded-md text-sm outline-none transition-colors"
              />
              <button className="w-full bg-light-text dark:bg-dark-text text-light-bg dark:text-dark-bg hover:bg-primary dark:hover:bg-primary px-6 py-2.5 rounded-md font-semibold text-sm transition-colors">
                Subscribe
              </button>
            </form>
          </div>

        </div>
        
        <div className="border-t border-light-border dark:border-dark-border mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-light-muted dark:text-dark-muted">
          <p>© 2026 Miva. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
