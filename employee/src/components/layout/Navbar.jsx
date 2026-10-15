import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Building2, 
  ShieldCheck, 
  LogOut, 
  DollarSign, 
  Eye,
  EyeOff
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [showSalary, setShowSalary] = useState(false);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <span className="text-xl">M</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">MIVA</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                  Employee Portal :5176
                </span>
              </div>
              <p className="text-xs text-slate-500">Cổng Vận Hành & Quản Lý Đơn Hàng Dành Cho Nhân Viên</p>
            </div>
          </div>

          {/* Center Info: Department & Scope */}
          <div className="hidden lg:flex items-center space-x-4 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center space-x-2 text-xs">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-slate-700">{user?.department || 'Vận hành đơn hàng'}</span>
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <div className="flex items-center space-x-1.5 text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Phạm vi: {user?.assignedOrderScope === 'all_orders' ? 'Toàn bộ đơn (All)' : user?.assignedOrderScope || 'Phân quyền'}</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Salary preview toggle */}
            <button
              onClick={() => setShowSalary(!showSalary)}
              title="Xem thông tin lương nhân viên"
              className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>{showSalary ? formatCurrency(user?.salary || 0) : 'Lương: ••••••••'}</span>
              {showSalary ? <EyeOff className="w-3 h-3 text-slate-400" /> : <Eye className="w-3 h-3 text-slate-400" />}
            </button>

            {/* Profile Pill & Logout */}
            <div className="flex items-center pl-2 border-l border-slate-200 space-x-2">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'}
                alt={user?.fullName}
                className="w-8 h-8 rounded-full border border-slate-200 object-cover"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{user?.fullName || 'Nhân viên Miva'}</p>
                <p className="text-[11px] font-mono text-slate-500 leading-tight">{user?.employeeCode || 'EMP'}</p>
              </div>

              <button
                onClick={logout}
                title="Đăng xuất khỏi hệ thống"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
