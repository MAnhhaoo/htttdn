'use client';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container section">
      <div className="hero" style={{ minHeight: '300px', marginBottom: 'var(--space-10)' }}>
        <div className="hero-content" style={{ padding: 'var(--space-10)' }}>
          <h1 style={{ fontSize: 'var(--text-4xl)', color: 'white' }}>About Miva</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Everything you need, all in one place. We are redefining the premium e-commerce experience.</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>Our Story</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Founded in 2024, Miva was built on a simple premise: shopping online should be a beautiful, seamless, and trustworthy experience. We grew tired of cluttered marketplaces that compromised on design and user experience. So, we built Miva.
        </p>

        <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>Our Mission</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Our mission is to connect consumers with the world's best products through an elegant, intuitive platform. We carefully curate our sellers and prioritize quality over quantity.
        </p>

        <div className="features-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 'var(--space-10)', marginBottom: 'var(--space-10)' }}>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h4 className="feature-title">Premium Quality</h4>
            <p className="feature-desc">We meticulously vet all products and sellers to ensure the highest standards.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h4 className="feature-title">Secure & Safe</h4>
            <p className="feature-desc">Your data and payments are protected with state-of-the-art encryption.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💚</div>
            <h4 className="feature-title">Customer First</h4>
            <p className="feature-desc">Our support team is available 24/7 to assist you with anything you need.</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>Join the Journey</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>Experience the new standard of online shopping.</p>
          <Link href="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
        </div>
      </div>
    </div>
  );
}
