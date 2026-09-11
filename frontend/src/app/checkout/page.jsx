'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 0 && subtotal < 50 ? 5.99 : 0;
  const total = subtotal + shippingFee;

  const handleNextStep = (e) => {
    e.preventDefault();
    setStep(step + 1);
  };

  const handlePlaceOrder = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      clearCart();
      window.location.href = '/checkout/success';
    }, 1500);
  };

  if (items.length === 0 && !loading) {
    return (
      <div className="container section empty-state">
        <div className="empty-state-icon">🛒</div>
        <h3>Checkout Unavailable</h3>
        <p>Your cart is empty. Please add items to your cart before proceeding to checkout.</p>
        <Link href="/products" className="btn btn-primary">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="section-header">
        <h1 className="section-title">Checkout</h1>
      </div>

      {/* Progress Tracker */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-10)', maxWidth: 600, margin: '0 auto var(--space-10)' }}>
        <div style={{ textAlign: 'center', color: step >= 1 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= 1 ? 'var(--gold)' : 'var(--bg-secondary)', color: step >= 1 ? 'white' : 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 'bold' }}>1</div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>Shipping</div>
        </div>
        <div style={{ flex: 1, height: 2, background: step >= 2 ? 'var(--gold)' : 'var(--bg-secondary)', margin: '0 16px', position: 'relative', top: '-10px' }}></div>
        <div style={{ textAlign: 'center', color: step >= 2 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= 2 ? 'var(--gold)' : 'var(--bg-secondary)', color: step >= 2 ? 'white' : 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 'bold' }}>2</div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>Payment</div>
        </div>
        <div style={{ flex: 1, height: 2, background: step >= 3 ? 'var(--gold)' : 'var(--bg-secondary)', margin: '0 16px', position: 'relative', top: '-10px' }}></div>
        <div style={{ textAlign: 'center', color: step >= 3 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= 3 ? 'var(--gold)' : 'var(--bg-secondary)', color: step >= 3 ? 'white' : 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 'bold' }}>3</div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>Review</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-10)' }}>
        {/* Forms */}
        <div>
          {step === 1 && (
            <div className="card" style={{ padding: 'var(--space-8)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>Shipping Information</h2>
              <form onSubmit={handleNextStep}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-input" required defaultValue="Alex" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-input" required defaultValue="Johnson" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-input" required defaultValue="123 Miva Street" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input type="text" className="form-input" required defaultValue="San Francisco" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input type="text" className="form-input" required defaultValue="CA" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ZIP Code</label>
                    <input type="text" className="form-input" required defaultValue="94105" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-input" required defaultValue="+1 (555) 123-4567" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                  <button type="submit" className="btn btn-primary">Continue to Payment</button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="card" style={{ padding: 'var(--space-8)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>Payment Method</h2>
              <form onSubmit={handleNextStep}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                  <label className="card" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', cursor: 'pointer', border: '1px solid var(--gold)' }}>
                    <input type="radio" name="payment" defaultChecked style={{ width: 18, height: 18, accentColor: 'var(--gold)' }} />
                    <span style={{ fontWeight: 600, flex: 1 }}>Credit / Debit Card</span>
                    <div className="payment-methods" style={{ margin: 0 }}>
                      <div className="payment-icon" style={{ fontSize: 10, padding: 2 }}>VISA</div>
                      <div className="payment-icon" style={{ fontSize: 10, padding: 2 }}>MC</div>
                    </div>
                  </label>
                  
                  <label className="card" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', cursor: 'pointer', border: '1px solid var(--border-color)' }}>
                    <input type="radio" name="payment" style={{ width: 18, height: 18, accentColor: 'var(--gold)' }} />
                    <span style={{ fontWeight: 600, flex: 1 }}>PayPal</span>
                    <div className="payment-icon" style={{ fontSize: 10, padding: 2, margin: 0 }}>PP</div>
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input type="text" className="form-input" placeholder="0000 0000 0000 0000" required defaultValue="4111 1111 1111 1111" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input type="text" className="form-input" placeholder="MM/YY" required defaultValue="12/26" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVC</label>
                    <input type="text" className="form-input" placeholder="123" required defaultValue="123" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input type="text" className="form-input" required defaultValue="Alex Johnson" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-6)' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                  <button type="submit" className="btn btn-primary">Review Order</button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="card" style={{ padding: 'var(--space-8)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>Review Your Order</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Shipping Address</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                    Alex Johnson<br/>
                    123 Miva Street<br/>
                    San Francisco, CA 94105<br/>
                    +1 (555) 123-4567
                  </div>
                  <button onClick={() => setStep(1)} style={{ color: 'var(--gold)', background: 'none', border: 'none', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)', cursor: 'pointer' }}>Edit</button>
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Payment Method</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                    Credit Card ending in 1111<br/>
                    Expiry: 12/26
                  </div>
                  <button onClick={() => setStep(2)} style={{ color: 'var(--gold)', background: 'none', border: 'none', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)', cursor: 'pointer' }}>Edit</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-6)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
                <button type="button" className="btn btn-primary" onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="card" style={{ padding: 'var(--space-6)', position: 'sticky', top: 'calc(var(--header-height) + 20px)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-5)' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-color)' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <img src={item.image} alt={item.name} style={{ width: 50, height: 50, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-5)', color: 'var(--text-secondary)' }}>
              <span>Shipping</span>
              <span>{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span>
            </div>

            <div style={{ height: 1, background: 'var(--border-color)', margin: 'var(--space-5) 0' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xl)', fontWeight: 700 }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
