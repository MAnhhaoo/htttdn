import { UserCircle, Moon, Sun, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

export default function Header() {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-[#131B17]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-6 transition-colors">
      <div>
        {user?.approvalStatus === 'pending_approval' && (
          <div className="flex items-center gap-1.5 text-xs px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full font-medium">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>ĐKKD: Đang chờ xét duyệt</span>
          </div>
        )}
        {user?.approvalStatus === 'approved' && (
          <div className="flex items-center gap-1.5 text-xs px-3 py-1 bg-[#EEF5F1] dark:bg-[#1A3A2C]/40 text-[#1A3A2C] dark:text-emerald-300 border border-[#2A5C4A]/25 dark:border-[#2A5C4A]/60 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2A5C4A] dark:text-[#C9A84C]" />
            <span>Gian hàng đã xác thực ĐKKD</span>
          </div>
        )}
        {user?.approvalStatus === 'rejected' && (
          <div
            className="flex items-center gap-1.5 text-xs px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-full font-medium"
            title={user?.rejectedReason || ''}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ĐKKD chưa được duyệt</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 hover:text-[#1A3A2C] hover:bg-[#EEF5F1] dark:text-slate-400 dark:hover:text-[#DEC47E] dark:hover:bg-[#1A3A2C]/50 transition-colors"
          title="Đổi giao diện Sáng / Tối"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <NotificationDropdown />
        <div className="flex items-center ml-2 pl-3 border-l border-slate-200/80 dark:border-slate-800">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user?.storeName || user?.fullName || 'Gian hàng'}
              className="w-8 h-8 rounded-full object-cover border border-[#C9A84C]/50 ring-2 ring-[#1A3A2C]/10 dark:ring-[#C9A84C]/20 mr-2.5"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A3A2C] to-[#2A5C4A] text-[#DEC47E] border border-[#C9A84C]/35 flex items-center justify-center mr-2.5 shrink-0">
              <UserCircle className="w-5 h-5 text-[#DEC47E]" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              {user?.storeName || user?.fullName || 'Gian hàng Đối tác'}
            </span>
            <span className="text-xs text-[#2A5C4A] dark:text-[#DEC47E] font-medium">
              {user?.taxId ? `MST: ${user.taxId}` : 'Đối tác MIVA'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
