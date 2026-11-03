import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Store,
  Tags, 
  ShoppingCart, 
  Ticket,
  Star,
  LineChart,
  LogOut,
  UserCheck,
  Truck,
  Calculator,
  ClipboardList,
  ShieldCheck,
  PieChart,
  Sparkles
} from 'lucide-react';

const navGroups = [
  {
    title: 'TỔNG QUAN & PHÂN TÍCH',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Phân tích Doanh thu', path: '/analytics', icon: LineChart },
      { name: 'Phân tích Khách hàng', path: '/customer-analytics', icon: PieChart },
    ],
  },
  {
    title: 'QUẢN LÝ ĐỐI TÁC & BÁN HÀNG',
    items: [
      { name: 'Duyệt Đăng ký Vendor', path: '/vendor-registrations', icon: ShieldCheck },
      { name: 'Danh sách Vendor', path: '/vendors', icon: Store },
      { name: 'Quản lý Đơn hàng', path: '/orders', icon: ShoppingCart },
      { name: 'Vận chuyển & Điều phối', path: '/shipping', icon: Truck },
      { name: 'Danh mục', path: '/categories', icon: Tags },
      { name: 'Mã giảm giá', path: '/vouchers', icon: Ticket },
    ],
  },
  {
    title: 'NHÂN SỰ & VẬN HÀNH CRM',
    items: [
      { name: 'Nhân sự & Nhân viên', path: '/employees', icon: UserCheck },
      { name: 'Bảng lương & Chấm công', path: '/payroll', icon: Calculator },
      { name: 'Khảo sát CRM', path: '/surveys', icon: ClipboardList },
      { name: 'Khách hàng', path: '/users', icon: Users },
      { name: 'Đánh giá sản phẩm', path: '/reviews', icon: Star },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen flex flex-col shrink-0 border-r border-slate-800 shadow-xl select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0 bg-slate-900/90 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-wider">ADMIN PORTAL</h1>
            <p className="text-[10px] text-slate-400 font-medium">Miva Marketplace Hub</p>
          </div>
        </div>
      </div>

      {/* Nav List with Sleek Custom Scrollbar */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {group.title}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive 
                            ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/25' 
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 mr-2.5 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sticky User Profile & Logout Footer */}
      <div className="p-3 border-t border-slate-800/90 bg-slate-900/95 shrink-0">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5 mb-2 rounded-lg bg-slate-800/50 text-xs">
          <div className="truncate">
            <p className="font-semibold text-slate-200 truncate">{user?.fullName || 'Quản trị viên'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@miva.vn'}</p>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            ROOT
          </span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/20 transition-all"
        >
          <LogOut className="w-3.5 h-3.5 mr-2" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
