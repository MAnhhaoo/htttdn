'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function OrderSuccessPage() {
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    // Generate a random order number
    const randomOrder = 'MVA' + Math.floor(Math.random() * 10000000).toString().padStart(8, '0');
    setOrderNumber(randomOrder);
  }, []);

  return (
    <div className="container section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ maxWidth: 500, width: '100%', padding: 'var(--space-10)', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-3)' }}>Order Successful!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
          Thank you for your purchase. We've received your order and are currently processing it.
        </p>

        <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-8)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>Order Number</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{orderNumber}</div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)', flexDirection: 'column' }}>
          <Link href="/account/orders" className="btn btn-primary btn-lg">View Order Status</Link>
          <Link href="/products" className="btn btn-outline btn-lg">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
