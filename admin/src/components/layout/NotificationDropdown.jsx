import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, ShieldCheck, ClipboardList } from 'lucide-react';
import { notificationsApi } from '../../api';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationsApi.getUnreadCount();
      const count = typeof res?.data === 'number' ? res.data : (res?.data?.count ?? 0);
      setUnreadCount(count);
    } catch (err) {}
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.getNotifications({ page: 1, itemPerPage: 20 });
      const items = res?.data?.list || (Array.isArray(res?.data) ? res.data : []);
      setNotifications(items);
    } catch (err) {
      console.error('Failed to load admin notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(item => (item.id === id ? { ...item, isRead: true } : item))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (err) {}
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden text-slate-800 dark:text-slate-100 animate-fade-in">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Thông báo Hệ thống</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 rounded-full border border-rose-200 dark:border-rose-800">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Đã đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Đang tải thông báo...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isSurvey = notif.type === 'survey_invitation' || notif.surveyId;

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors relative flex items-start gap-3 ${
                      !notif.isRead ? 'bg-blue-50/20 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    {!notif.isRead && (
                      <span className="absolute top-4 left-2 w-2 h-2 rounded-full bg-blue-500" />
                    )}

                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {isSurvey ? (
                        <ClipboardList className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Bell className="w-5 h-5 text-amber-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3" /> Quản trị viên
                        </span>
                      </div>

                      <h4 className={`text-xs sm:text-sm leading-tight text-slate-900 dark:text-white ${!notif.isRead ? 'font-bold' : 'font-semibold'}`}>
                        {notif.title}
                      </h4>

                      {notif.content && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {notif.content}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                        <span>
                          {new Date(notif.createdAt).toLocaleDateString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </span>
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
