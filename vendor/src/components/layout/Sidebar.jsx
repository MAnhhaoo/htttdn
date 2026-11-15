import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  Package,
  Ticket,
  ClipboardList,
  Settings,
  Store,
  LogOut,
} from 'lucide-react';

const navGroups = [
  {
    title: 'VẬN HÀNH BÁN HÀNG',
    items: [
      { name: 'Tổng quan & Doanh thu', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Đơn hàng & Đóng gói', path: '/orders', icon: Boxes },
      { name: 'Sản phẩm & Đánh giá', path: '/products', icon: Package },
    ],
  },
  {
    title: 'TIẾP THỊ & CÀI ĐẶT',
    items: [
      { name: 'Mã giảm giá Shop', path: '/vouchers', icon: Ticket },
      { name: 'Khảo sát Khách hàng & BQT', path: '/surveys', icon: ClipboardList },
      { name: 'Hồ sơ & Gói Kinh doanh', path: '/settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const partnerName = user?.storeName || user?.fullName || 'Gian hàng Đối tác';
  const partnerInitial = partnerName.trim().charAt(0).toUpperCase() || 'M';

  return (
    <aside className="w-64 bg-gradient-to-b from-[#08130E] to-[#0E2219] text-[#A3B8AE] border-r border-[#1A3327] min-h-screen flex flex-col shrink-0">
      <div className="h-16 flex items-center px-5 border-b border-[#1A3327]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#9E7B23] text-[#08130E] shadow-lg shadow-[#C9A84C]/20 flex items-center justify-center mr-3 shrink-0">
          <Store className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-black text-white tracking-wider leading-tight">MIVA</h1>
          <p className="text-[11px] text-[#C9A84C] font-semibold tracking-wide">
            Kênh Người Bán
          </p>
        </div>
      </div>

      <nav className="flex-1 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title} className="px-3">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#6F8C7E]">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `group flex items-center px-3 py-2.5 rounded-lg text-sm transition-all ${
                          isActive
                            ? 'bg-[#1A3A2C]/90 text-white font-semibold border-l-[3px] border-[#C9A84C] shadow-sm'
                            : 'hover:bg-[#142920] hover:text-white border-l-[3px] border-transparent'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`w-4 h-4 mr-3 shrink-0 transition-colors ${
                              isActive
                                ? 'text-[#C9A84C]'
                                : 'text-[#89A396] group-hover:text-white'
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-3.5 border-t border-[#1A3327] space-y-2">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-[#0F241A]/90 border border-[#1A3327]">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={partnerName}
              className="w-8 h-8 rounded-lg object-cover border border-[#C9A84C]/35 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#1A3A2C] text-[#DEC47E] border border-[#C9A84C]/30 flex items-center justify-center text-xs font-bold shrink-0">
              {partnerInitial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{partnerName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-[#C9A84C]/15 text-[#DEC47E] border border-[#C9A84C]/30">
                PARTNER
              </span>
              {user?.taxId && (
                <span className="text-[10px] text-[#7F9A8D] truncate">#{user.taxId}</span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 rounded-lg text-sm text-[#A3B8AE] hover:text-white hover:bg-[#142920] transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3 text-[#89A396]" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
