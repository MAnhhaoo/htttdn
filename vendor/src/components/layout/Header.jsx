import { UserCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 flex items-center justify-between px-6 transition-colors shadow-sm dark:shadow-none">
      <div>{/* Empty div to keep flex space-between structure if needed, or remove and change justify-between to justify-end */}</div>

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
