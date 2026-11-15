import { useState, useRef, useEffect, useMemo } from 'react';
import { Moon, Sun, Search, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import { getWorkspaceByPathname, WORKSPACE_GROUPS } from './workspaceConfig';

const SEARCHABLE_ITEMS = WORKSPACE_GROUPS.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    category: group.title,
  })),
);

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeWorkspace = getWorkspaceByPathname(pathname);
  const WorkspaceIcon = activeWorkspace?.icon;

  const [query, setQuery] = useState('');
  const [openSearch, setOpenSearch] = useState(false);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setOpenSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SEARCHABLE_ITEMS;
    return SEARCHABLE_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    );
  }, [query]);

  const handleSelectWorkspace = (path) => {
    navigate(path);
    setQuery('');
    setOpenSearch(false);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-[#131B17]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 px-6 transition-colors shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {WorkspaceIcon && (
          <div className="w-9 h-9 rounded-xl bg-[#EEF5F1] dark:bg-[#1A3A2C]/60 text-[#1A3A2C] dark:text-[#DEC47E] flex items-center justify-center shrink-0 border border-[#2A5C4A]/15 dark:border-[#C9A84C]/25">
            <WorkspaceIcon className="w-4 h-4" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 truncate">
            {activeWorkspace?.name}
          </h2>
          {activeWorkspace?.subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden lg:block">
              {activeWorkspace.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Quick Workspace Search */}
      <div ref={searchBoxRef} className="hidden md:block relative w-72 lg:w-80">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onFocus={() => setOpenSearch(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpenSearch(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpenSearch(false);
              if (e.key === 'Enter' && searchResults[0]) {
                handleSelectWorkspace(searchResults[0].path);
              }
            }}
            placeholder="Tìm nhanh phân hệ quản trị..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-[#F4F5F3] dark:bg-[#0B110E] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2A5C4A]/30 focus:border-[#2A5C4A] transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {openSearch && (
          <div className="absolute right-0 left-0 mt-2 bg-white dark:bg-[#131B17] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 max-h-72 overflow-y-auto custom-scrollbar">
            {searchResults.length === 0 ? (
              <div className="px-3.5 py-4 text-center text-xs text-slate-400">
                Không tìm thấy phân hệ phù hợp
              </div>
            ) : (
              searchResults.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleSelectWorkspace(item.path)}
                    className="w-full px-3.5 py-2 text-left hover:bg-[#EEF5F1]/80 dark:hover:bg-[#1A3A2C]/40 flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ItemIcon className="w-4 h-4 text-[#2A5C4A] dark:text-[#C9A84C] shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF5F1] text-[#1A3A2C] dark:bg-[#1A3A2C]/70 dark:text-[#DEC47E] border border-[#C9A84C]/25 shrink-0">
                      MIVA Hub
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 hover:bg-[#EEF5F1] hover:text-[#1A3A2C] dark:text-slate-400 dark:hover:bg-[#1A3A2C]/50 dark:hover:text-[#DEC47E] transition-colors"
          title={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <NotificationDropdown />
      </div>
    </header>
  );
}
