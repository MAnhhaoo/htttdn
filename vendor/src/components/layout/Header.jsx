import { UserCircle, Moon, Sun, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 flex items-center justify-between px-6 transition-colors shadow-sm dark:shadow-none">
      <div>
        {user?.approvalStatus === 'pending_approval' && (
          <div className="flex items-center gap-1.5 text-xs px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full font-medium">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>ĐKKD: Đang chờ xét duyệt</span>
          </div>
        )}
        {user?.approvalStatus === 'approved' && (
          <div className="flex items-center gap-1.5 text-xs px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Gian hàng đã xác thực ĐKKD</span>
          </div>
        )}
        {user?.approvalStatus === 'rejected' && (
          <div className="flex items-center gap-1.5 text-xs px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-full font-medium" title={user?.rejectedReason || ''}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ĐKKD chưa được duyệt</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <NotificationDropdown />
        <div className="flex items-center cursor-pointer ml-2">
          <UserCircle className="w-8 h-8 text-indigo-400 dark:text-indigo-500 mr-2" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {user?.storeName || user?.fullName || 'Vendor'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {user?.taxId ? `MST: ${user.taxId}` : 'Vendor'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
