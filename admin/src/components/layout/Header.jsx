import { Bell, Search, UserCircle, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 transition-colors">
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 w-96">
        <Search className="w-5 h-5 text-slate-400 mr-2" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-transparent border-none outline-none text-sm w-full dark:text-slate-200"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        <div className="flex items-center ml-2">
          <UserCircle className="w-8 h-8 text-slate-400 dark:text-slate-500 mr-2" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.fullName || 'Admin'}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role || 'Administrator'}</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="p-2 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
          title="Đăng xuất"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
