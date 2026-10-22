import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

export default function RealtimeBridge() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user?.id) return;
    const socket = io('/realtime', { auth: { role: 'admin' }, withCredentials: true });
    const dispatch = (name) => () => window.dispatchEvent(new Event(`miva:${name}`));
    const orders = dispatch('orders');
    const shipping = dispatch('shipping');
    const products = dispatch('products');
    const categories = dispatch('categories');
    const notifications = dispatch('notification');
    const dashboard = dispatch('dashboard');
    socket.on('realtime:ready', () => { orders(); shipping(); products(); categories(); notifications(); dashboard(); });
    socket.on('order:created', () => { orders(); shipping(); products(); notifications(); dashboard(); });
    socket.on('order:updated', () => { orders(); shipping(); products(); notifications(); dashboard(); });
    socket.on('payment:updated', () => { orders(); dashboard(); });
    socket.on('shipment:updated', () => { shipping(); orders(); dashboard(); });
    socket.on('product:updated', () => { products(); dashboard(); });
    socket.on('category:updated', () => { categories(); products(); dashboard(); });
    socket.on('notification:created', notifications);
    socket.on('notification:updated', notifications);
    return () => socket.disconnect();
  }, [user?.id]);
  return null;
}
