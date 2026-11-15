import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  DollarSign,
  Eye,
  EyeOff,
  Menu,
  Sun,
  Moon,
  Clock,
} from 'lucide-react';
import { SharedNotificationDropdown } from '@shared/components/common/NotificationDropdown';
import { formatCurrency } from '@shared/utils/formatHelpers';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { notificationsApi } from '../../api/axiosClient';

function resolvePageTitle(pathname, search) {
  if (pathname.startsWith('/shipping')) {
    return 'Giao Hàng Nội Bộ (Bưu Tá)';
  }
  if (pathname.startsWith('/profile')) {
    return 'Hồ Sơ & Hợp Đồng Lương';
  }
  const params = new URLSearchParams(search);
  const view = params.get('view');
  if (view === 'sla') return 'Giám Sát Tiến Độ & SLA Vendor';
  if (view === 'audit') return 'Nhật Ký Kiểm Toán Đơn Hàng';
  return 'Điều Phối & Giám Sát Đơn Hàng';
}

export const Navbar = ({ onOpenSidebar, onOpenCheckIn }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [showSalary, setShowSalary] = useState(false);

  const pageTitle = resolvePageTitle(location.pathname, location.search);
  const scopeLabel =
    user?.assignedOrderScope === 'all_orders'
      ? 'Toàn bộ đơn'
      : user?.scopeName || user?.assignedOrderScope || 'Phân quyền';

  return (
    <header className="h-16 bg-white/95 dark:bg-[#131B17]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 transition-colors">
      {/* Left: Mobile Menu + Page Title + Department Scope Badge */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 -ml-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          aria-label="Mở thanh điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
          {pageTitle}
        </h2>

        <div className="hidden xl:inline-flex items-center gap-2.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#EEF5F1] text-[#1A3A2C] dark:bg-[#1A3A2C]/45 dark:text-[#8BBAA1] border border-[#B9D6C6]/50 dark:border-[#2A5C4A]/50 shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#2A5C4A] dark:text-[#DEC47E]" />
            <span>{user?.department || 'Vận hành đơn hàng'}</span>
          </span>
          <span className="h-3.5 w-px bg-[#B9D6C6] dark:bg-[#2A5C4A]" />
          <span className="inline-flex items-center gap-1 text-[#2A5C4A] dark:text-[#DEC47E]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Phạm vi: {scopeLabel}</span>
          </span>
        </div>
      </div>

      {/* Right: Attendance, Salary Eye Toggle, Theme Toggle, Notifications */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {onOpenCheckIn && (
          <button
            type="button"
            onClick={onOpenCheckIn}
            title="Chấm công / Điểm danh vào ca"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#2A5C4A] dark:hover:bg-[#35755B] text-white shadow-xs transition cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[#DEC47E]" />
            <span>Chấm công</span>
          </button>
        )}

        {/* Quick Salary Pill + Eye Toggle */}
        <button
          type="button"
          onClick={() => setShowSalary(!showSalary)}
          title="Xem thông tin lương nhân viên"
          className="flex items-center space-x-1.5 text-xs font-semibold bg-[#FBF7EC] dark:bg-[#C9A84C]/15 border border-[#C9A84C]/35 text-[#8C6B1F] dark:text-[#DEC47E] hover:bg-[#F5EBD0] dark:hover:bg-[#C9A84C]/25 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
        >
          <DollarSign className="w-3.5 h-3.5 text-[#B08726] dark:text-[#DEC47E]" />
          <span className="hidden sm:inline">
            {showSalary ? formatCurrency(user?.salary || 0) : 'Lương: ••••••••'}
          </span>
          <span className="sm:hidden">
            {showSalary ? formatCurrency(user?.salary || 0) : '••••'}
          </span>
          {showSalary ? (
            <EyeOff className="w-3.5 h-3.5 opacity-80" />
          ) : (
            <Eye className="w-3.5 h-3.5 opacity-80" />
          )}
        </button>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
          aria-label="Chuyển đổi giao diện Sáng / Tối"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-[#DEC47E] hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Realtime Notification Dropdown */}
        <SharedNotificationDropdown
          title="Thông báo Nội bộ"
          senderBadgeLabel="Điều hành MIVA"
          fetchNotificationsFn={notificationsApi.getMyNotifications}
          markAsReadFn={notificationsApi.markRead}
          markAllAsReadFn={notificationsApi.markAllAsRead}
          enabled={Boolean(user?.id)}
        />
      </div>
    </header>
  );
};
