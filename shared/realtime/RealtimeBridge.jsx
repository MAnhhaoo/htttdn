import { useEffect } from 'react';
import { io } from 'socket.io-client';

/**
 * Cầu nối Socket.IO Realtime dùng chung cho Admin, Vendor và Employee.
 * Khi nhận sự kiện từ `/realtime`, tự động phát CustomEvent `miva:<channel>` trên `window`.
 */
export function SharedRealtimeBridge({ userId, role }) {
  useEffect(() => {
    if (!userId) return;

    const socket = io('/realtime', {
      auth: { role },
      withCredentials: true,
    });

    const pendingTimers = new Map();
    const emit = (channel, detail = null) => {
      if (pendingTimers.has(channel)) {
        clearTimeout(pendingTimers.get(channel));
      }
      const timer = setTimeout(() => {
        pendingTimers.delete(channel);
        window.dispatchEvent(new CustomEvent(`miva:${channel}`, { detail }));
      }, 300);
      pendingTimers.set(channel, timer);
    };

    let hasConnectedOnce = false;
    let needsReconnectSync = false;

    socket.on('disconnect', () => {
      if (hasConnectedOnce) needsReconnectSync = true;
    });

    socket.on('realtime:ready', () => {
      const shouldSync = needsReconnectSync;
      hasConnectedOnce = true;
      needsReconnectSync = false;
      if (!shouldSync) return;
      emit('orders');
      emit('shipping');
      emit('products');
      emit('categories');
      emit('notification');
      emit('dashboard');
    });

    socket.on('order:created', (payload) => {
      emit('orders', payload);
      emit('shipping', payload);
      emit('products', payload);
      emit('notification', payload);
      emit('dashboard', payload);
    });

    socket.on('order:updated', (payload) => {
      emit('orders', payload);
      emit('shipping', payload);
      emit('products', payload);
      emit('notification', payload);
      emit('dashboard', payload);
    });

    socket.on('payment:updated', (payload) => {
      emit('orders', payload);
      emit('dashboard', payload);
    });

    socket.on('shipment:updated', (payload) => {
      emit('shipping', payload);
      emit('orders', payload);
      emit('dashboard', payload);
    });

    socket.on('product:updated', (payload) => {
      emit('products', payload);
      emit('dashboard', payload);
    });

    socket.on('category:updated', (payload) => {
      emit('categories', payload);
      emit('dashboard', payload);
    });

    socket.on('notification:created', (payload) => emit('notification', payload));
    socket.on('notification:updated', (payload) => emit('notification', payload));

    return () => {
      pendingTimers.forEach((timer) => clearTimeout(timer));
      pendingTimers.clear();
      socket.disconnect();
    };
  }, [userId, role]);

  return null;
}

export default SharedRealtimeBridge;

