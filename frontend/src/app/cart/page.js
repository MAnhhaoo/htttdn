'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const originalTotal = items.reduce((sum, item) => sum + ((item.originalPrice || item.price) * item.quantity), 0);
  const discount = originalTotal - subtotal;
  const shippingFee = subtotal > 0 && subtotal < 50 ? 5.99 : 0;
  const total = subtotal + shippingFee;

  const handleUpdateQuantity = async (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    setLoading(true);
    await updateQuantity(itemId, newQty);
    setLoading(false);
  };

  const handleRemove = async (itemId) => {
    if (confirm('Remove this item from cart?')) {
      setLoading(true);
      await removeItem(itemId);
      setLoading(false);
      addToast('Item removed from cart', 'success');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container section">
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link href="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="section-header">
        <h1 className="section-title" style={{ fontSize: 'var(--text-3xl)' }}>Shopping Cart</h1>
        <span className="section-subtitle">{items.length} items</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-10)' }}>
        {/* Cart Items */}
        <div>
          <div className="card" style={{ padding: '0 var(--space-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', padding: 'var(--space-4) 0', borderBottom: '1px solid var(--border-color)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <div>Product</div>
              <div style={{ textAlign: 'center' }}>Quantity</div>
              <div style={{ textAlign: 'right' }}>Total</div>
            </div>

            {items.map(item => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', gap: 'var(--space-4)', padding: 'var(--space-6) 0', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                  <img src={item.image} alt={item.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }} />
                  <div>
                    <Link href={`/products/${item.productId}`} style={{ fontWeight: 600, display: 'block', marginBottom: 'var(--space-1)' }}>{item.name}</Link>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>Variant: {item.variant}</div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>${item.price.toFixed(2)}</span>
                      {item.originalPrice > item.price && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>${item.originalPrice.toFixed(2)}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <div className="quantity-selector">
                    <button className="quantity-btn" onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)} disabled={item.quantity <= 1 || loading}>-</button>
                    <input type="text" className="quantity-value" value={item.quantity} readOnly />
                    <button className="quantity-btn" onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)} disabled={loading}>+</button>
                  </div>
                  <button onClick={() => handleRemove(item.id)} style={{ fontSize: 'var(--text-xs)', color: 'var(--error)', cursor: 'pointer', background: 'none', border: 'none' }}>Remove</button>
                </div>

                <div style={{ textAlign: 'right', fontWeight: 600 }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card" style={{ padding: 'var(--space-6)', position: 'sticky', top: 'calc(var(--header-height) + 20px)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-5)' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span>${originalTotal.toFixed(2)}</span>
            </div>
            
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)', color: 'var(--success)' }}>
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-5)', color: 'var(--text-secondary)' }}>
              <span>Shipping</span>
              <span>{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span>
            </div>

            <div style={{ height: 1, background: 'var(--border-color)', margin: 'var(--space-5) 0' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-6)', fontSize: 'var(--text-xl)', fontWeight: 700 }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <Link href="/checkout" className="btn btn-primary btn-lg btn-full" style={{ marginBottom: 'var(--space-4)' }}>
              Proceed to Checkout
            </Link>

            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
              We accept Visa, Mastercard, PayPal, and Apple Pay.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
