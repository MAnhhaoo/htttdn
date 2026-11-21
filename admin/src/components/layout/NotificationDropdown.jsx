import { useNavigate } from 'react-router-dom';
import { SharedNotificationDropdown } from '@shared/components/common/NotificationDropdown';
import { notificationsApi } from '../../api';

export default function NotificationDropdown() {
  const navigate = useNavigate();

  return (
    <SharedNotificationDropdown
      title="Thông báo Hệ thống"
      senderBadgeLabel="Hệ thống MIVA"
      fetchNotificationsFn={notificationsApi.getNotifications}
      fetchUnreadCountFn={notificationsApi.getUnreadCount}
      markAsReadFn={notificationsApi.markAsRead}
      markAllAsReadFn={notificationsApi.markAllAsRead}
      onNotificationClick={(notif) => {
        if (notif.type === 'order_update' || notif.data?.orderId) {
          navigate('/orders');
        }
      }}
    />
  );
}
