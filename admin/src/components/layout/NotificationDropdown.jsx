import { SharedNotificationDropdown } from '@shared/components/common/NotificationDropdown';
import { notificationsApi } from '../../api';

export default function NotificationDropdown() {
  return (
    <SharedNotificationDropdown
      title="Thông báo Hệ thống"
      senderBadgeLabel="Hệ thống MIVA"
      fetchNotificationsFn={notificationsApi.getNotifications}
      fetchUnreadCountFn={notificationsApi.getUnreadCount}
      markAsReadFn={notificationsApi.markAsRead}
      markAllAsReadFn={notificationsApi.markAllAsRead}
    />
  );
}
