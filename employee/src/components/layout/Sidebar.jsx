import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  Send, 
  Truck, 
  AlertTriangle, 
  History, 
  ShieldAlert,
  HelpCircle,
  FileText,
  User,
  Store
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar = ({ pendingCount = 2, confirmedCount = 1, exceptionCount = 1 }) => {
  const { user } = useAuth();
  const department = user?.department || '';

  const isVendorLink = department.includes('Điều phối');
  const isShipping = department.includes('Vận chuyển');
  const isExceptions = department.includes('Sự cố');

  let navItems = [
    {
      to: '/orders',
      icon: Package,
      label: 'Đơn hàng được quản lý',
      end: true,
      roles: ['vendor_link', 'exceptions', 'all'],
    },
    {
      to: '/orders?status=pending',
      icon: Clock,
      label: 'Chờ xác nhận',
      badge: pendingCount,
      badgeColor: 'bg-amber-100 text-amber-800',
      roles: ['vendor_link', 'all'],
    },
    {
      to: '/orders?status=confirmed',
      icon: Send,
      label: 'Chuyển đơn cho Vendor',
      badge: confirmedCount,
      badgeColor: 'bg-blue-100 text-blue-800',
      roles: ['vendor_link', 'all'],
    },
    {
      to: '/vendor-tracking',
      icon: Store,
      label: 'Theo dõi VendorOrder',
      roles: ['vendor_link', 'exceptions', 'all'],
    },
    {
      to: '/shipping',
      icon: Truck,
      label: 'Tiếp nhận & Giao hàng (Bưu tá)',
      roles: ['shipping', 'all'],
    },
    {
      to: '/orders?exception=true',
      icon: AlertTriangle,
      label: 'Xử lý sự cố & Ngoại lệ',
      badge: exceptionCount,
      badgeColor: 'bg-rose-100 text-rose-800',
      roles: ['exceptions', 'all'],
    },
    {
      to: '/audit-history',
      icon: History,
      label: 'Xem lịch sử trạng thái',
      roles: ['vendor_link', 'shipping', 'exceptions', 'all'],
    },
    {
      to: '/permissions-faq',
      icon: ShieldAlert,
      label: 'Quy tắc & Phạm vi quyền hạn',
      roles: ['vendor_link', 'shipping', 'exceptions', 'all'],
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

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Nhiệp vụ phân quyền
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Notice of Restricted Powers */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs">
          <div className="flex items-center space-x-1.5 text-amber-800 font-bold mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Phạm vi phân quyền</span>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            Nhân viên chỉ có quyền xác nhận, điều phối vendor và xử lý sự cố đơn hàng. Không có quyền sửa đổi User, Vendor, Sản phẩm hoặc Voucher.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
        <p className="font-semibold text-slate-600">Miva Marketplace v2.6</p>
        <p>Employee Port: 5176</p>
      </div>
    </aside>
  );
};
