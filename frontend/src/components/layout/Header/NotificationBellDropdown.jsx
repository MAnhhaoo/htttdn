import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Clock, Store, ShieldCheck, ClipboardList, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { notificationService } from '../../../services/notificationService';
import SurveyModal from '../../survey/SurveyModal';

export default function NotificationBellDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'survey' | 'unread'
  const [activeSurveyResponseId, setActiveSurveyResponseId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const refresh = () => {
      fetchUnreadCount();
      if (isOpen) loadNotifications();
    };
    window.addEventListener('miva:notification', refresh);
    return () => window.removeEventListener('miva:notification', refresh);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Click outside to close
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
      const res = await notificationService.getUnreadCount();
      // Handle res as number or object { count: number }
      const count = typeof res === 'number' ? res : res?.count ?? 0;
      setUnreadCount(count);
    } catch (err) {
      // User might be guest/unauthenticated
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications({ page: 1, itemPerPage: 20 });
      const items = res?.list || (Array.isArray(res) ? res : []);
      setNotifications(items);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(item => (item.id === id ? { ...item, isRead: true } : item))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    // 1. Mark as read
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications(prev =>
          prev.map(item => (item.id === notif.id ? { ...item, isRead: true } : item))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (e) {
        // Ignore error
      }
    }

    // 2. Open survey modal if it has survey response
    const responseId = notif.surveyResponseId || notif.data?.responseId;
    if (responseId) {
      setActiveSurveyResponseId(responseId);
      setIsModalOpen(true);
      setIsOpen(false);
    }
  };

  const handleSurveySubmitted = (responseId) => {
    // Update local notification state to 'submitted'
    setNotifications(prev =>
      prev.map(item => {
        if (item.surveyResponseId === responseId || item.data?.responseId === responseId) {
          return {
            ...item,
            response: { ...item.response, status: 'submitted' }
          };
        }
        return item;
      })
    );
  };

  const filteredNotifications = notifications.filter(item => {
    if (activeTab === 'unread') return !item.isRead;
    if (activeTab === 'survey') return item.type === 'survey_invitation' || item.surveyId;
    return true;
  });

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bell Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-light-muted dark:text-dark-muted hover:text-[#1A3A2C] dark:hover:text-primary transition-colors rounded-full focus:outline-none"
          title="Thông báo"
        >
          <Bell className="w-5 h-5 text-[#1A3A2C] dark:text-white" strokeWidth={2.5} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-[#c26d53] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#FAF7F2] dark:border-dark-card shadow-sm animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Thông báo</h3>
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
                  className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Đã đọc tất cả
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center px-3 pt-2 pb-1 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('survey')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'survey'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                Khảo sát ({notifications.filter(i => i.type === 'survey_invitation' || i.surveyId).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('unread')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'unread'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                Chưa đọc ({notifications.filter(i => !i.isRead).length})
              </button>
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Đang tải thông báo...</span>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Không có thông báo nào</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const isSurvey = notif.type === 'survey_invitation' || notif.surveyId;
                  const responseStatus = notif.response?.status;
                  const isSubmitted = responseStatus === 'submitted';
                  const isExpired = notif.expiresAt && new Date(notif.expiresAt) < new Date();

                  // Sender detection
                  const isMiva = notif.survey?.scope === 'platform' || notif.survey?.admin || !notif.survey?.vendor;
                  const senderName = isMiva ? 'MIVA Platform' : (notif.survey?.vendor?.storeName || 'Cửa hàng MIVA');

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors relative flex items-start gap-3 ${
                        !notif.isRead ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                      }`}
                    >
                      {/* Unread indicator dot */}
                      {!notif.isRead && (
                        <span className="absolute top-4 left-2 w-2 h-2 rounded-full bg-emerald-500" />
                      )}

                      {/* Icon */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {isSurvey ? (
                          <ClipboardList className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Bell className="w-5 h-5 text-blue-600" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Sender & Badge */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          {isMiva ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                              <ShieldCheck className="w-3 h-3" /> {senderName}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                              <Store className="w-3 h-3" /> {senderName}
                            </span>
                          )}

                          {/* Response Status Badge */}
                          {isSurvey && (
                            isSubmitted ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-100/60 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3" /> Đã trả lời
                              </span>
                            ) : isExpired ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                Hết hạn
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-100/60 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
                                Chưa trả lời
                              </span>
                            )
                          )}
                        </div>

                        {/* Title */}
                        <h4 className={`text-xs sm:text-sm leading-tight text-slate-900 dark:text-white ${!notif.isRead ? 'font-bold' : 'font-semibold'}`}>
                          {notif.title}
                        </h4>

                        {/* Content Intro */}
                        {notif.content && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                            {notif.content}
                          </p>
                        )}

                        {/* Survey Action Buttons */}
                        {isSurvey && (notif.surveyResponseId || notif.data?.responseId) && (
                          <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const rId = notif.surveyResponseId || notif.data?.responseId;
                                setIsOpen(false);
                                navigate(`/surveys/${rId}`);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {isSubmitted ? 'Xem lại trên trang riêng' : 'Làm khảo sát (trang riêng)'}
                            </button>
                          </div>
                        )}

                        {/* Metadata Footer: Sent Time & Deadline */}
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                          <span>
                            {new Date(notif.createdAt).toLocaleDateString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </span>
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

            {/* Dropdown Footer */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/surveys');
                }}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Xem tất cả khảo sát & đóng góp ý kiến
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Survey Answer Modal */}
      <SurveyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        surveyResponseId={activeSurveyResponseId}
        onSubmitted={handleSurveySubmitted}
      />
    </>
  );
}
