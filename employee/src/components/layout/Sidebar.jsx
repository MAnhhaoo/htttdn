import { NavLink } from 'react-router-dom';
import { Package, Truck, ShieldAlert, User, LogOut, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuth();
  const department = user?.department || '';

  const isVendorLink = department.includes('Điều phối');
  const isShipping = department.includes('Vận chuyển') || department.includes('Giao nhận');
  const isExceptions = department.includes('Sự cố');

  let navItems = [
    {
      to: '/orders',
      icon: Package,
      label: 'Điều phối đơn hàng',
      roles: ['vendor_link', 'exceptions', 'all'],
    },
    {
      to: '/shipping',
      icon: Truck,
      label: 'Quản lý giao hàng (Bưu tá)',
      roles: ['shipping', 'all'],
    },
    {
      to: '/profile',
      icon: User,
      label: 'Hồ sơ & Hợp đồng lương',
      roles: ['vendor_link', 'shipping', 'exceptions', 'all'],
    },
  ];

  // Lọc theo đúng ban nghiệp vụ
  if (isVendorLink) {
    navItems = navItems.filter((item) => item.roles.includes('vendor_link'));
  } else if (isShipping) {
    navItems = navItems.filter((item) => item.roles.includes('shipping'));
  } else if (isExceptions) {
    navItems = navItems.filter((item) => item.roles.includes('exceptions'));
  }

  const userInitial = user?.fullName?.[0]?.toUpperCase() || 'S';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:translate-x-0 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 shrink-0 bg-gradient-to-b from-[#08130E] to-[#0E2219] text-[#A3B8AE] border-r border-[#1A3327] flex flex-col`}
      >
        {/* Top 64px Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#1A3327] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#9E7B23] text-[#08130E] shadow-lg shadow-[#C9A84C]/20 flex items-center justify-center font-black text-base shrink-0">
              M
            </div>
            <div className="min-w-0">
              <p className="text-white font-black tracking-tight text-sm leading-tight truncate">
                MIVA OPS
              </p>
              <p className="text-[11px] font-semibold text-[#C9A84C] leading-tight mt-0.5 truncate">
                Cổng Nhân Viên
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#A3B8AE] hover:text-white hover:bg-[#142920] transition"
            aria-label="Đóng thanh điều hướng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation & Scope Info */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6 custom-scrollbar">
          <div>
            <p className="px-3 text-[10px] font-bold text-[#6E8B7E] uppercase tracking-widest mb-2.5">
              Nghiệp vụ phân quyền
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose?.()}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3 py-2.5 rounded-r-xl text-xs transition ${
                        isActive
                          ? 'bg-[#1A3A2C]/90 text-white font-semibold border-l-[3px] border-[#C9A84C] shadow-sm'
                          : 'text-[#A3B8AE] hover:bg-[#142920] hover:text-white border-l-[3px] border-transparent font-medium'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <div className="flex items-center space-x-3 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-[#C9A84C]'
                              : 'text-[#7FA090] group-hover:text-white'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Phạm vi phân quyền Box */}
          <div className="bg-[#0F241B]/90 border border-[#1E3B2E] rounded-xl p-3 text-xs text-[#B9D6C6]">
            <div className="flex items-center space-x-1.5 text-[#DEC47E] font-bold mb-1.5">
              <ShieldAlert className="w-4 h-4 text-[#DEC47E] shrink-0" />
              <span>Phạm vi phân quyền</span>
            </div>
            <p className="text-[11px] text-[#B9D6C6] leading-relaxed">
              {isVendorLink &&
                'Nhiệm vụ Điều phối: Kiểm tra, duyệt đơn hàng, chuyển đơn cho Vendor và giám sát cam kết SLA xuất kho.'}
              {isShipping &&
                'Nhiệm vụ Bưu tá: Tiếp nhận kiện hàng từ kho Vendor/Hub và trực tiếp giao đến tay khách hàng.'}
              {isExceptions &&
                'Nhiệm vụ Sự cố: Tiếp nhận và xử lý các sự cố, ngoại lệ đơn hàng trong phạm vi phân quyền.'}
              {!isVendorLink &&
                !isShipping &&
                !isExceptions &&
                'Thực hiện công việc theo đúng phạm vi phân công của bộ phận.'}
            </p>
          </div>
        </div>

        {/* Bottom Employee Profile & Logout Footer */}
        <div className="border-t border-[#1A3327] p-3 bg-[#08130E]/60 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#1A3A2C] text-[#C9A84C] border border-[#C9A84C]/30 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || 'Employee'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  userInitial
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight truncate">
                  {user?.fullName || 'Nhân viên MIVA'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DEC47E] truncate">
                    {user?.employeeCode || 'STAFF'}
                  </span>
                  {department && (
                    <>
                      <span className="text-[#4F6D60] text-[10px]">•</span>
                      <span className="text-[10px] text-[#8BA397] truncate">{department}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Đăng xuất khỏi hệ thống"
              className="p-2 text-[#A3B8AE] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
