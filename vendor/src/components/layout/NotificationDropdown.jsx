import { useNavigate } from 'react-router-dom';
import { SharedNotificationDropdown } from '@shared/components/common/NotificationDropdown';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';

export default function NotificationDropdown({ onSelectSurvey }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <SharedNotificationDropdown
      title="Thông báo Đối tác"
      senderBadgeLabel="Ban Quản Trị MIVA"
      fetchNotificationsFn={notificationService.getNotifications}
      fetchUnreadCountFn={notificationService.getUnreadCount}
      markAsReadFn={notificationService.markAsRead}
      markAllAsReadFn={notificationService.markAllAsRead}
      enabled={Boolean(user?.id)}
      onNotificationClick={(notif) => {
        if (notif.surveyId || notif.type === 'survey_invitation') {
          if (onSelectSurvey) {
            onSelectSurvey(notif.surveyId, notif.id);
          } else {
            navigate(`/surveys?tab=from_admin&responseId=${notif.id}`);
          }
          return;
        }
        if (notif.type === 'order_update' || notif.data?.orderId) {
          navigate('/orders');
        }
      }}
    />
  );
}
