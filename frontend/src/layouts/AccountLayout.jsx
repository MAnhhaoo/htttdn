import { NavLink, Outlet } from 'react-router-dom';
import { User, ShoppingBag, Heart, ClipboardList, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ACCOUNT_TABS = [
  { to: '/profile', label: 'Hồ sơ & Địa chỉ', icon: User, end: true },
  { to: '/orders', label: 'Đơn mua', icon: ShoppingBag },
  { to: '/favorites', label: 'Yêu thích', icon: Heart },
  { to: '/surveys', label: 'Khảo sát', icon: ClipboardList, end: true },
];

export default function AccountLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-14rem)] bg-[#FAF7F2] dark:bg-dark-bg py-6 sm:py-10 transition-colors">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Compact User Summary + Horizontal Navigation Tabs */}
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-luxury dark:shadow-luxury-dark overflow-hidden">
          {/* User Summary Strip */}
          <div className="px-5 sm:px-7 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#1A3A2C]/5 via-primary/5 to-transparent dark:from-primary/10 dark:via-transparent border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg overflow-hidden shrink-0">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || 'Avatar'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  user?.fullName?.charAt(0)?.toUpperCase() || <User className="w-6 h-6" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-light-text dark:text-dark-text truncate">
                    {user?.fullName || 'Khách hàng MIVA'}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/15 text-primary-dark dark:text-primary border border-primary/25">
                    <Sparkles className="w-3 h-3" /> Thành viên MIVA
                  </span>
                </div>
                <p className="text-xs text-light-muted dark:text-dark-muted truncate mt-0.5">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Horizontal Navigation Tabs */}
          <nav
            aria-label="Điều hướng tài khoản"
            className="px-3 sm:px-5 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none"
          >
            {ACCOUNT_TABS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-3.5 sm:px-4 py-3.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                    isActive
                      ? 'border-primary text-[#1A3A2C] dark:text-primary'
                      : 'border-transparent text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:border-light-border dark:hover:border-dark-border'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Account Sub-page Content */}
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
