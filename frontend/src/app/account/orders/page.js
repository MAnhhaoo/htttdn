'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.getOrders('all');
        setOrders(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'var(--success)';
      case 'processing': return 'var(--info)';
      case 'shipping': return 'var(--warning)';
      case 'cancelled': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 10 }}></div>;

  return (
    <div className="card" style={{ padding: 'var(--space-8)' }}>
      <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-6)' }}>My Orders</h2>
      
      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No orders yet</h3>
          <p>You haven't placed any orders. Start shopping to see your history here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {orders.map(order => (
            <div key={order.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Order #{order.orderNumber}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>${order.total.toFixed(2)}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: getStatusColor(order.status), fontWeight: 600, textTransform: 'uppercase' }}>
                    {order.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                    <div style={{ width: 60, height: 60, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{item.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Variant: {item.variant}</div>
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)' }}>x{item.quantity}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
                <button className="btn btn-secondary btn-sm">View Details</button>
                <button className="btn btn-outline btn-sm">Track Order</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
