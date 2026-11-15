import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, Clock, ShieldCheck, ClipboardList, CheckCircle2 } from 'lucide-react';

/**
 * Dropdown Chuông Thông Báo dùng chung cho Admin, Vendor và Employee.
 * Không chạy polling 30s dư thừa khi đã có sự kiện realtime `miva:notification`.
 */
export function SharedNotificationDropdown({
  title = 'Thông báo',
  senderBadgeLabel = 'Hệ thống MIVA',
  fetchNotificationsFn,
  fetchUnreadCountFn,
  markAsReadFn,
  markAllAsReadFn,
  onNotificationClick,
  enabled = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const loadUnreadCount = useCallback(async () => {
    if (!enabled) return;
    try {
      if (fetchUnreadCountFn) {
        const res = await fetchUnreadCountFn();
        const raw = res?.data ?? res;
        const count = typeof raw === 'number' ? raw : raw?.count ?? 0;
        setUnreadCount(Number(count) || 0);
      } else if (fetchNotificationsFn) {
        const res = await fetchNotificationsFn({ page: 1, itemPerPage: 30 });
        const raw = res?.data ?? res;
        const items = raw?.list || (Array.isArray(raw) ? raw : []);
        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.isRead).length);
      }
    } catch {
      // Bỏ qua lỗi mạng nền
    }
  }, [enabled, fetchUnreadCountFn, fetchNotificationsFn]);

  const loadNotifications = useCallback(async () => {
    if (!enabled || !fetchNotificationsFn) return;
    try {
      setLoading(true);
      const res = await fetchNotificationsFn({ page: 1, itemPerPage: 20 });
      const raw = res?.data ?? res;
      const items = raw?.list || (Array.isArray(raw) ? raw : []);
      setNotifications(items);
      if (!fetchUnreadCountFn) {
        setUnreadCount(items.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, fetchNotificationsFn, fetchUnreadCountFn]);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  useEffect(() => {
    if (!enabled) return;
    const refresh = () => {
      loadUnreadCount();
      if (isOpen) loadNotifications();
    };
    window.addEventListener('miva:notification', refresh);
    return () => window.removeEventListener('miva:notification', refresh);
  }, [enabled, isOpen, loadUnreadCount, loadNotifications]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async () => {
    if (!markAllAsReadFn) return;
    try {
      await markAllAsReadFn();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleClickItem = async (notif) => {
    if (!notif.isRead && markAsReadFn) {
      try {
        await markAsReadFn(notif.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === notif.id ? { ...item, isRead: true } : item)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    }
    if (onNotificationClick) {
      const shouldClose = onNotificationClick(notif);
      if (shouldClose !== false) setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title={title}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden text-slate-800 dark:text-slate-100">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1A3A2C] dark:text-[#C9A84C]" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {title}
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-[#FBF7EC] text-[#8C6B1F] dark:bg-[#C9A84C]/20 dark:text-[#DEC47E] rounded-full border border-[#C9A84C]/35">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && markAllAsReadFn && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs text-[#1A3A2C] hover:text-[#2A5C4A] dark:text-[#8BBAA1] font-medium hover:underline flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Đã đọc hết
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-6 h-6 border-2 border-[#1A3A2C] dark:border-[#8BBAA1] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Đang tải thông báo...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isSurvey = notif.type === 'survey_invitation' || Boolean(notif.surveyId);
                const isSubmitted =
                  notif.response?.status === 'submitted' || notif.data?.status === 'submitted';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleClickItem(notif)}
                    className={`p-3.5 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors relative flex items-start gap-3 ${
                      !notif.isRead ? 'bg-[#EEF5F1]/60 dark:bg-[#1A3A2C]/20' : ''
                    }`}
                  >
                    {!notif.isRead && (
                      <span className="absolute top-4 left-2 w-2 h-2 rounded-full bg-[#C9A84C]" />
                    )}

                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {isSurvey ? (
                        <ClipboardList className="w-5 h-5 text-[#1A3A2C] dark:text-[#8BBAA1]" />
                      ) : (
                        <Bell className="w-5 h-5 text-[#C9A84C]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1A3A2C] dark:text-[#8BBAA1] bg-[#EEF5F1] dark:bg-[#1A3A2C]/40 px-1.5 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3" /> {notif.sender || senderBadgeLabel}
                        </span>
                        {isSurvey &&
                          (isSubmitted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-100/60 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" /> Đã phản hồi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-100/60 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
                              Khảo sát mới
                            </span>
                          ))}
                      </div>

                      <h4
                        className={`text-xs sm:text-sm leading-tight text-slate-900 dark:text-white ${
                          !notif.isRead ? 'font-bold' : 'font-semibold'
                        }`}
                      >
                        {notif.title}
                      </h4>

                      {(notif.content || notif.message) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {notif.content || notif.message}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                        {notif.createdAt && (
                          <span>
                            {new Date(notif.createdAt).toLocaleDateString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </span>
                        )}
                        {notif.expiresAt && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3 h-3" />
                            Hạn: {new Date(notif.expiresAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SharedNotificationDropdown;

