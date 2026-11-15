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

    const emit = (channel) => {
      window.dispatchEvent(new Event(`miva:${channel}`));
    };

    socket.on('realtime:ready', () => {
      emit('orders');
      emit('shipping');
      emit('products');
      emit('categories');
      emit('notification');
      emit('dashboard');
    });

    socket.on('order:created', () => {
      emit('orders');
      emit('shipping');
      emit('products');
      emit('notification');
      emit('dashboard');
    });

    socket.on('order:updated', () => {
      emit('orders');
      emit('shipping');
      emit('products');
      emit('notification');
      emit('dashboard');
    });

    socket.on('payment:updated', () => {
      emit('orders');
      emit('dashboard');
    });

    socket.on('shipment:updated', () => {
      emit('shipping');
      emit('orders');
      emit('dashboard');
    });

    socket.on('product:updated', () => {
      emit('products');
      emit('dashboard');
    });

    socket.on('category:updated', () => {
      emit('categories');
      emit('dashboard');
    });

    socket.on('notification:created', () => emit('notification'));
    socket.on('notification:updated', () => emit('notification'));

    return () => socket.disconnect();
  }, [userId, role]);

  return null;
}

export default SharedRealtimeBridge;

