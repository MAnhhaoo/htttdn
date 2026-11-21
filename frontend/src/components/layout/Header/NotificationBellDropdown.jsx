import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  Clock,
  Store,
  ShieldCheck,
  ClipboardList,
  CheckCircle2,
  ExternalLink,
  Package,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { notificationService } from '../../../services/notificationService';
import SurveyModal from '../../survey/SurveyModal';

export default function NotificationBellDropdown() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'survey' | 'unread'
  const [activeSurveyResponseId, setActiveSurveyResponseId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await notificationService.getUnreadCount();
      const count = typeof res === 'number' ? res : res?.count ?? 0;
      setUnreadCount(count);
    } catch {
      // Ignore unauthorized or network glitches
    }
  }, [isAuthenticated]);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
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
  }, [isAuthenticated]);

  // Initial unread count load when authenticated (no polling — Socket.IO RealtimeBridge dispatches miva:notification)
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setNotifications([]);
      setIsOpen(false);
      return;
    }
    fetchUnreadCount();
  }, [isAuthenticated, fetchUnreadCount]);

  // Listen to RealtimeBridge Socket.IO notification event
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const refresh = () => {
      fetchUnreadCount();
      if (isOpen) loadNotifications();
    };
    window.addEventListener('miva:notification', refresh);
    return () => window.removeEventListener('miva:notification', refresh);
  }, [isAuthenticated, isOpen, fetchUnreadCount, loadNotifications]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadNotifications();
    }
  }, [isOpen, isAuthenticated, loadNotifications]);

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

  if (!isAuthenticated) return null;

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === notif.id ? { ...item, isRead: true } : item)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Ignore error
      }
    }

    const responseId = notif.surveyResponseId || notif.data?.responseId;
    if (responseId) {
      setActiveSurveyResponseId(responseId);
      setIsModalOpen(true);
      setIsOpen(false);
      return;
    }

    if (notif.type === 'order_update' || notif.data?.orderId) {
      setIsOpen(false);
      navigate('/orders');
    }
  };

  const handleSurveySubmitted = (responseId) => {
    setNotifications((prev) =>
      prev.map((item) => {
        if (item.surveyResponseId === responseId || item.data?.responseId === responseId) {
          return {
            ...item,
            response: { ...item.response, status: 'submitted' },
          };
        }
        return item;
      }),
    );
  };

  const filteredNotifications = notifications.filter((item) => {
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
          className="relative p-2 text-light-muted dark:text-dark-muted hover:text-[#1A3A2C] dark:hover:text-primary transition-colors rounded-full focus:outline-none cursor-pointer"
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
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-light-border dark:border-dark-border z-50 overflow-hidden animate-fade-in text-light-text dark:text-dark-text">
            {/* Header */}
            <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-base text-light-text dark:text-dark-text">Thông báo</h3>
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
                  className="text-xs text-primary hover:text-primary-dark font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Đã đọc tất cả
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 px-3 pt-2 pb-1.5 border-b border-light-border dark:border-dark-border bg-light-bg/60 dark:bg-dark-bg/40 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-dark-card text-primary shadow-sm font-semibold'
                    : 'text-light-muted hover:text-light-text dark:text-dark-muted'
                }`}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('survey')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'survey'
                    ? 'bg-white dark:bg-dark-card text-primary shadow-sm font-semibold'
                    : 'text-light-muted hover:text-light-text dark:text-dark-muted'
                }`}
              >
                Khảo sát ({notifications.filter((i) => i.type === 'survey_invitation' || i.surveyId).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('unread')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'unread'
                    ? 'bg-white dark:bg-dark-card text-primary shadow-sm font-semibold'
                    : 'text-light-muted hover:text-light-text dark:text-dark-muted'
                }`}
              >
                Chưa đọc ({notifications.filter((i) => !i.isRead).length})
              </button>
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-light-border dark:divide-dark-border">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-light-muted dark:text-dark-muted gap-2">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Đang tải thông báo...</span>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-12 text-center text-light-muted dark:text-dark-muted">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Không có thông báo nào</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const isSurvey = notif.type === 'survey_invitation' || notif.surveyId;
                  const isOrderUpdate = notif.type === 'order_update' || Boolean(notif.data?.orderId);
                  const responseStatus = notif.response?.status;
                  const isSubmitted = responseStatus === 'submitted';
                  const isExpired = notif.expiresAt && new Date(notif.expiresAt) < new Date();

                  const isMiva =
                    notif.survey?.scope === 'platform' || notif.survey?.admin || !notif.survey?.vendor;
                  const senderName = isMiva
                    ? 'MIVA Platform'
                    : notif.survey?.vendor?.storeName || 'Cửa hàng MIVA';

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 sm:p-4 hover:bg-light-bg dark:hover:bg-dark-bg/60 cursor-pointer transition-colors relative flex items-start gap-3 ${
                        !notif.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''
                      }`}
                    >
                      {!notif.isRead && (
                        <span className="absolute top-4 left-2 w-2 h-2 rounded-full bg-primary" />
                      )}

                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text border border-light-border dark:border-dark-border">
                        {isSurvey ? (
                          <ClipboardList className="w-5 h-5 text-emerald-600" />
                        ) : isOrderUpdate ? (
                          <Package className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Bell className="w-5 h-5 text-primary" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
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

                          {isOrderUpdate && !isSurvey && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                              Đơn hàng
                            </span>
                          )}

                          {isSurvey &&
                            (isSubmitted ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-100/60 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3" /> Đã trả lời
                              </span>
                            ) : isExpired ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-light-muted bg-light-bg dark:bg-dark-bg px-1.5 py-0.5 rounded">
                                Hết hạn
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-100/60 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
                                Chưa trả lời
                              </span>
                            ))}
                        </div>

                        <h4
                          className={`text-xs sm:text-sm leading-tight text-light-text dark:text-dark-text ${
                            !notif.isRead ? 'font-bold' : 'font-semibold'
                          }`}
                        >
                          {notif.title}
                        </h4>

                        {notif.content && (
                          <p className="text-xs text-light-muted dark:text-dark-muted line-clamp-2 mt-1">
                            {notif.content}
                          </p>
                        )}

                        {isSurvey && (notif.surveyResponseId || notif.data?.responseId) && (
                          <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-light-border dark:border-dark-border">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const rId = notif.surveyResponseId || notif.data?.responseId;
                                setIsOpen(false);
                                navigate(`/surveys/${rId}`);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#1A3A2C] hover:bg-[#2A5C4A] text-white transition-colors cursor-pointer shadow-xs"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {isSubmitted ? 'Xem lại trên trang riêng' : 'Làm khảo sát (trang riêng)'}
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-[11px] text-light-muted dark:text-dark-muted">
                          <span>
                            {new Date(notif.createdAt).toLocaleDateString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </span>
                          {notif.expiresAt && (
                            <span className="flex items-center gap-1">
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
            <div className="p-2.5 bg-light-bg dark:bg-dark-bg/60 border-t border-light-border dark:border-dark-border text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/surveys');
                }}
                className="text-xs font-semibold text-primary hover:text-primary-dark hover:underline inline-flex items-center gap-1 cursor-pointer"
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
