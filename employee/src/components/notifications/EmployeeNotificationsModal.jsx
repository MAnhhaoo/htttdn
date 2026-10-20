import React, { useState, useEffect } from 'react';
import { 
  Bell, X, Check, CheckCheck, AlertTriangle, AlertOctagon, Info, Zap, 
  Clock, ShieldAlert, Loader2 
} from 'lucide-react';
import { notificationsApi } from '../../api/axiosClient';

const TYPE_CONFIG = {
  warning: {
    label: 'Cảnh báo kỷ luật',
    icon: AlertTriangle,
    bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  alert: {
    label: 'Khiển trách & Xử lý',
    icon: AlertOctagon,
    bg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  urgent: {
    label: 'Khẩn cấp / Điều phối',
    icon: Zap,
    bg: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  info: {
    label: 'Thông báo',
    icon: Info,
    bg: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
  },
};

export const EmployeeNotificationsModal = ({ isOpen, onClose, onRefreshCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.getMyNotifications();
      const list = res.list || [];
      setNotifications(list);
      setUnreadCount(res.unreadCount || 0);
      if (onRefreshCount) onRefreshCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching employee notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const handleMarkRead = async (notifId) => {
    try {
      await notificationsApi.markRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (onRefreshCount) onRefreshCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      if (onRefreshCount) onRefreshCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Thông Báo &amp; Cảnh Báo Từ Quản Trị</h3>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Đã đọc tất cả thông báo'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Đã đọc hết
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mb-2" />
              Đang tải danh sách thông báo...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-semibold text-slate-600">Chưa có thông báo nào</p>
              <p className="text-xs text-slate-400 mt-0.5">Các thông báo phân công và cảnh báo kỷ luật từ Ban Quản Trị sẽ hiển thị tại đây.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const conf = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
              const Icon = conf.icon;
              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border transition-all ${
                    notif.isRead
                      ? 'bg-white border-slate-200 text-slate-700'
                      : `${conf.bg} font-medium shadow-xs`
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-lg ${conf.badge} shrink-0 mt-0.5`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${conf.badge}`}>
                            {conf.label}
                          </span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                          )}
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {notif.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mt-1">
                          {notif.content}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-2 italic">
                          Người gửi: <span className="font-semibold text-slate-600">{notif.sender || 'Ban Quản Trị'}</span>
                        </p>
                      </div>
                    </div>

                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        title="Đánh dấu đã đọc"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition shrink-0"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Quy chế: Nhân viên có trách nhiệm đọc và tuân thủ các cảnh báo từ Ban Quản Trị</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 font-semibold text-slate-700 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
