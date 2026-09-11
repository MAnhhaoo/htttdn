'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function DealsPage() {
  const [flashSales, setFlashSales] = useState([]);
  const [todayDeals, setTodayDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ h: '08', m: '51', s: '59' });

  useEffect(() => {
    async function loadDeals() {
      try {
        const [flashRes, todayRes] = await Promise.all([
          api.getFlashSale(),
          api.getTodayDeals()
        ]);
        setFlashSales(flashRes.data || []);
        setTodayDeals(todayRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDeals();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let s = parseInt(prev.s) - 1;
        let m = parseInt(prev.m);
        let h = parseInt(prev.h);
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return { 
          h: h.toString().padStart(2, '0'), 
          m: m.toString().padStart(2, '0'), 
          s: s.toString().padStart(2, '0') 
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return <div className="container section"><div className="skeleton" style={{height: 400, borderRadius: 20}}></div></div>;
  }

  return (
    <div className="container section">
      {/* Header */}
      <div className="hero" style={{ minHeight: 200, marginBottom: 'var(--space-10)', background: 'var(--text-primary)' }}>
        <div className="hero-content" style={{ padding: 'var(--space-10)' }}>
          <h1 style={{ fontSize: 'var(--text-4xl)', color: 'white' }}>Hot Deals & Offers 🔥</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Don't miss out on these limited-time offers. Save big on premium products.</p>
        </div>
      </div>

      {/* Flash Sale */}
      {flashSales.length > 0 && (
        <section className="section pt-0">
          <div className="section-header">
            <h2 className="section-title">⚡ Flash Sale</h2>
            <div className="countdown">
              <span>Ends in: </span>
              <div className="countdown-block">{timeLeft.h}</div>
              <span className="countdown-separator">:</span>
              <div className="countdown-block">{timeLeft.m}</div>
              <span className="countdown-separator">:</span>
              <div className="countdown-block">{timeLeft.s}</div>
            </div>
          </div>
          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {flashSales.map(deal => (
              <Link key={deal.id} href={`/products/${deal.product?.slug}`} className="product-card">
                <div className="product-card-image">
                  <img src={deal.product?.images[0]} alt={deal.product?.name} />
                  <div className="product-card-badge" style={{ background: 'var(--gold)' }}>{deal.discount}% OFF</div>
                </div>
                <div className="product-card-body">
                  <h3 className="product-card-name">{deal.product?.name}</h3>
                  <div className="product-card-price">
                    <span className="price-current" style={{ color: 'var(--error)' }}>${deal.dealPrice}</span>
                    <span className="price-original">${deal.originalPrice}</span>
                  </div>
                  <div className="deal-progress">
                    <div className="deal-progress-bar" style={{ width: `${(deal.sold / deal.stock) * 100}%` }}></div>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                    {deal.sold} / {deal.stock} sold
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Today's Deals */}
      {todayDeals.length > 0 && (
        <section className="section pt-0">
          <div className="section-header">
            <h2 className="section-title">🌟 Today's Deals</h2>
          </div>
          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {todayDeals.map(deal => (
              <Link key={deal.id} href={`/products/${deal.product?.slug}`} className="product-card">
                <div className="product-card-image">
                  <img src={deal.product?.images[0]} alt={deal.product?.name} />
                  <div className="product-card-badge">{deal.discount}% OFF</div>
                </div>
                <div className="product-card-body">
                  <h3 className="product-card-name">{deal.product?.name}</h3>
                  <div className="product-card-price">
                    <span className="price-current">${deal.dealPrice}</span>
                    <span className="price-original">${deal.originalPrice}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
