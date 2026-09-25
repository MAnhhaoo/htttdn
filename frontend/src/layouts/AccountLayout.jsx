import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { User, Package, Heart, LogOut } from 'lucide-react';
import { logoutAsync } from '../store/authSlice';

export default function AccountLayout() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutAsync());
    navigate('/login');
  };

  const navItems = [
    { name: 'Profile', path: '/account/profile', icon: User },
    { name: 'Orders', path: '/account/orders', icon: Package },
    { name: 'Wishlist', path: '/account/wishlist', icon: Heart },
  ];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-sm mb-6 md:mb-0 md:sticky md:top-28">
            
            {/* User Info Header */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-light-border dark:border-dark-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-light-text dark:text-dark-text truncate">{user?.fullName || 'User'}</h3>
                <p className="text-sm text-light-muted dark:text-dark-muted truncate">{user?.userEmail || user?.email || ''}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2">
              {navItems.map(item => (
                <NavLink 
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-light-muted dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-light-text dark:hover:text-dark-text'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 mt-4 transition-colors w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>

          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Outlet />
        </div>

      </div>
    </div>
  );
}
