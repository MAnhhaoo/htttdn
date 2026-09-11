'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo">
              <span>MI<span className="logo-accent">VA</span></span>
            </Link>
            <p>Everything you need, all in one place. Discover premium products you'll love with fast delivery and secure payments.</p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">fb</a>
              <a href="#" aria-label="Twitter">tw</a>
              <a href="#" aria-label="Instagram">ig</a>
              <a href="#" aria-label="YouTube">yt</a>
            </div>
          </div>

          <div>
            <h4 className="footer-title">About Miva</h4>
            <div className="footer-links">
              <Link href="/about" className="footer-link">About Us</Link>
              <Link href="/careers" className="footer-link">Careers</Link>
              <Link href="/blog" className="footer-link">Miva Blog</Link>
              <Link href="/press" className="footer-link">Press Center</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Customer Service</h4>
            <div className="footer-links">
              <Link href="/help" className="footer-link">Help Center</Link>
              <Link href="/returns" className="footer-link">Returns & Refunds</Link>
              <Link href="/shipping" className="footer-link">Shipping Info</Link>
              <Link href="/contact" className="footer-link">Contact Us</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Policies</h4>
            <div className="footer-links">
              <Link href="/privacy" className="footer-link">Privacy Policy</Link>
              <Link href="/terms" className="footer-link">Terms of Service</Link>
              <Link href="/cookie" className="footer-link">Cookie Policy</Link>
              <Link href="/security" className="footer-link">Security</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-title">My Account</h4>
            <div className="footer-links">
              <Link href="/account" className="footer-link">Profile</Link>
              <Link href="/account/orders" className="footer-link">Orders</Link>
              <Link href="/account/wishlist" className="footer-link">Wishlist</Link>
              <Link href="/account/vouchers" className="footer-link">Vouchers</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Miva. All rights reserved.</p>
          <div className="payment-methods">
            <div className="payment-icon">VISA</div>
            <div className="payment-icon">MC</div>
            <div className="payment-icon">PP</div>
            <div className="payment-icon">AP</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
