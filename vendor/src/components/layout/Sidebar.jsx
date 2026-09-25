import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Ticket,
  Star,
  LineChart,
  Settings,
  Store,
  LogOut
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Analytics', path: '/analytics', icon: LineChart },
  { name: 'My Products', path: '/products', icon: Package },
  { name: 'Orders', path: '/orders', icon: ShoppingCart },
  { name: 'Vouchers', path: '/vouchers', icon: Ticket },
  { name: 'Reviews', path: '/reviews', icon: Star },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-gradient-to-b from-indigo-950 to-indigo-900 text-indigo-200 min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-indigo-800">
        <Store className="w-6 h-6 text-indigo-400 mr-2" />
        <h1 className="text-xl font-bold text-white tracking-wider">VENDOR</h1>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-indigo-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-indigo-800">
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center w-full px-3 py-2.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-800 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
