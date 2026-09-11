'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVouchers() {
      try {
        const res = await api.getVouchers();
        setVouchers(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchVouchers();
  }, []);

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 10 }}></div>;

  return (
    <div className="card" style={{ padding: 'var(--space-8)' }}>
      <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-6)' }}>My Vouchers</h2>
      
      {vouchers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎟️</div>
          <h3>No vouchers available</h3>
          <p>Check back later for special discounts and promotions.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {vouchers.map(voucher => (
            <div key={voucher.id} className="voucher-card">
              <div className="voucher-left">
                <div className="voucher-discount">
                  {voucher.type === 'percentage' ? `${voucher.discount}%` : `$${voucher.discount}`}
                </div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8, marginTop: '4px' }}>OFF</div>
              </div>
              <div className="voucher-right">
                <div className="voucher-info">
                  <h4>{voucher.code}</h4>
                  <p>Min. Spend ${voucher.minOrder}</p>
                  {voucher.maxDiscount > 0 && voucher.type === 'percentage' && <p>Capped at ${voucher.maxDiscount}</p>}
                  <p style={{ color: 'var(--error)', marginTop: 'var(--space-1)' }}>Valid till {new Date(voucher.expiresAt).toLocaleDateString()}</p>
                </div>
                <button className="btn btn-outline btn-sm">Copy Code</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
