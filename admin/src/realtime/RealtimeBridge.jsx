import { SharedRealtimeBridge } from '@shared/realtime/RealtimeBridge';
import { useAuth } from '../contexts/AuthContext';

export default function RealtimeBridge() {
  const { user } = useAuth();
  return <SharedRealtimeBridge userId={user?.id} role="admin" />;
}
