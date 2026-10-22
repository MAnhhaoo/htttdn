import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

export default function RealtimeBridge() {
  const userId = useSelector((state) => state.auth.user?.id);
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io('/realtime', { auth: { role: userId ? 'client' : 'guest' }, withCredentials: true });
    const refreshOrders = (event) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (event?.orderId) queryClient.invalidateQueries({ queryKey: ['order', event.orderId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    };
    const refreshProducts = () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['checkout-preview'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['voucher-offers'] });
    };
    const refreshVouchers = () => {
      queryClient.invalidateQueries({ queryKey: ['voucher-offers'] });
      queryClient.invalidateQueries({ queryKey: ['checkout-preview'] });
    };
    const refreshCategories = () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      refreshProducts();
    };
    socket.on('realtime:ready', ({ role }) => {
      refreshCategories();
      refreshVouchers();
      if (role === 'client') {
        refreshOrders();
        window.dispatchEvent(new Event('miva:notification'));
      }
    });
    socket.on('order:created', refreshOrders);
    socket.on('order:updated', refreshOrders);
    socket.on('payment:updated', refreshOrders);
    socket.on('shipment:updated', refreshOrders);
    socket.on('product:updated', refreshProducts);
    socket.on('category:updated', refreshCategories);
    socket.on('voucher:updated', refreshVouchers);
    socket.on('notification:created', () => window.dispatchEvent(new Event('miva:notification')));
    socket.on('notification:updated', () => window.dispatchEvent(new Event('miva:notification')));
    return () => socket.disconnect();
  }, [userId, queryClient]);
  return null;
}
