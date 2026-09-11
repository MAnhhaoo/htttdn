'use client';
import { useState } from 'react';
import { useToast } from '@/context/ToastContext';

export default function ContactPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending message
    setTimeout(() => {
      setLoading(false);
      addToast('Message sent successfully! We will get back to you soon.', 'success');
      e.target.reset();
    }, 1500);
  };

  return (
    <div className="container section">
      <div className="hero" style={{ minHeight: '250px', marginBottom: 'var(--space-10)', background: 'var(--text-primary)' }}>
        <div className="hero-content" style={{ padding: 'var(--space-10)' }}>
          <h1 style={{ fontSize: 'var(--text-4xl)', color: 'white' }}>Contact Us</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>We're here to help. Get in touch with our team.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-10)' }}>
        {/* Contact Info */}
        <div>
          <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>Get in Touch</h3>
            
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>Email Support</div>
              <a href="mailto:support@miva.com" style={{ color: 'var(--gold)', fontWeight: 600 }}>support@miva.com</a>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>Phone</div>
              <a href="tel:+18001234567" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>+1 (800) 123-4567</a>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>Business Hours</div>
              <div style={{ color: 'var(--text-secondary)' }}>Mon-Fri: 9AM - 6PM EST<br/>Sat-Sun: Closed</div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)', color: 'var(--text-primary)' }}>Send us a Message</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">First Name</label>
                  <input type="text" className="form-input" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-input" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" required />
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <select className="form-select form-input" required>
                  <option value="">Select a topic</option>
                  <option value="order">Order Tracking / Issue</option>
                  <option value="returns">Returns & Refunds</option>
                  <option value="product">Product Information</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-input" rows="5" required></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
