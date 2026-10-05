import { Bell, UserCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

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

        <button className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
        <div className="flex items-center cursor-pointer ml-2">
          <UserCircle className="w-8 h-8 text-indigo-400 dark:text-indigo-500 mr-2" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nike Official</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Vendor</span>
          </div>
        </div>
      </div>
    </header>
  );
}
