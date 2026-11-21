import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

export default function RealtimeBridge() {
  const userId = useSelector((state) => state.auth.user?.id);
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io('/realtime', { auth: { role: userId ? 'client' : 'guest' }, withCredentials: true });
    let hasConnectedOnce = false;
    let needsReconnectSync = false;

    const refreshOrders = (event, includeProducts = false) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (event?.orderId) queryClient.invalidateQueries({ queryKey: ['order', event.orderId] });
      if (includeProducts) {
        queryClient.invalidateQueries({ queryKey: ['products'], refetchType: 'none' });
        queryClient.invalidateQueries({ queryKey: ['product'], refetchType: 'none' });
      }
    };
    const refreshProducts = (event) => {
      if (event?.productId) {
        queryClient.invalidateQueries({ queryKey: ['product', event.productId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['product'] });
      }
      queryClient.invalidateQueries({ queryKey: ['products'], refetchType: 'none' });
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
      queryClient.invalidateQueries({ queryKey: ['products'], refetchType: 'none' });
    };

    socket.on('disconnect', () => {
      if (hasConnectedOnce) needsReconnectSync = true;
    });

    socket.on('realtime:ready', ({ role } = {}) => {
      const shouldSync = needsReconnectSync;
      hasConnectedOnce = true;
      needsReconnectSync = false;
      if (!shouldSync) return;
      refreshCategories();
      refreshVouchers();
      if (role === 'client') {
        refreshOrders(null, false);
        window.dispatchEvent(new Event('miva:notification'));
      }
    });
    socket.on('order:created', (event) => refreshOrders(event, true));
    socket.on('order:updated', (event) => refreshOrders(event, true));
    socket.on('payment:updated', (event) => refreshOrders(event, false));
    socket.on('shipment:updated', (event) => refreshOrders(event, false));
    socket.on('product:updated', refreshProducts);
    socket.on('category:updated', refreshCategories);
    socket.on('voucher:updated', refreshVouchers);
    socket.on('notification:created', () => window.dispatchEvent(new Event('miva:notification')));
    socket.on('notification:updated', () => window.dispatchEvent(new Event('miva:notification')));
    return () => socket.disconnect();
  }, [userId, queryClient]);
  return null;
}
