import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

export default function RealtimeBridge() {
  const { user, token } = useAuth();
  useEffect(() => {
    if (!user?.id || !token) return;
    const socket = io('/realtime', { auth: { role: 'employee', token } });
    const orders = () => window.dispatchEvent(new Event('miva:orders'));
    const shipping = () => window.dispatchEvent(new Event('miva:shipping'));
    const notifications = () => window.dispatchEvent(new Event('miva:notification'));
    socket.on('realtime:ready', () => { orders(); shipping(); notifications(); });
    socket.on('order:created', () => { orders(); shipping(); });
    socket.on('order:updated', () => { orders(); shipping(); });
    socket.on('shipment:updated', shipping);
    socket.on('notification:created', notifications);
    socket.on('notification:updated', notifications);
    return () => socket.disconnect();
  }, [user?.id, token]);
  return null;
}
