import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { WORKSPACE_GROUPS } from './workspaceConfig';

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userInitial = (user?.fullName || 'A').trim().charAt(0).toUpperCase();

  return (
    <aside className="w-64 bg-gradient-to-b from-[#08130E] to-[#0E2219] text-[#A3B8AE] h-screen flex flex-col shrink-0 border-r border-[#1A3327] shadow-xl select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#1A3327] shrink-0 bg-[#08130E]/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#9E7B23] flex items-center justify-center text-[#08130E] shadow-lg shadow-[#C9A84C]/20">
            <Crown className="w-4.5 h-4.5 stroke-[2.25]" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight leading-none">MIVA</h1>
            <p className="text-[11px] text-[#C9A84C] font-semibold mt-0.5">Quản trị sàn</p>
          </div>
        </div>
      </div>

      {/* Consolidated 7 Workspaces Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 custom-scrollbar">
        {WORKSPACE_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-[#7A9689] uppercase">
              {group.title}
            </div>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `group flex items-center px-3 py-2.5 rounded-xl text-xs transition-all ${
                          isActive
                            ? 'bg-[#1A3A2C]/90 text-white font-semibold border-l-[3px] border-[#C9A84C] shadow-sm'
                            : 'text-[#A3B8AE] font-medium hover:bg-[#142920] hover:text-white border-l-[3px] border-transparent'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`w-4 h-4 mr-2.5 shrink-0 transition-colors ${
                              isActive
                                ? 'text-[#C9A84C]'
                                : 'text-[#7E998C] group-hover:text-white'
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

      {/* Sticky User Profile & Logout Footer */}
      <div className="p-3 border-t border-[#1A3327] bg-[#08130E]/70 shrink-0">
        <div className="flex items-center justify-between gap-2.5 px-2.5 py-2 mb-2 rounded-xl bg-[#0F241B]/90 border border-[#1E3B2E] text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#1A3A2C] text-[#C9A84C] border border-[#C9A84C]/30 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName || 'Admin'} className="w-full h-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <div className="truncate">
              <p className="font-semibold text-white truncate">
                {user?.fullName || 'Quản trị viên'}
              </p>
              <p className="text-[10px] text-[#8AA398] truncate">
                {user?.email || 'admin@miva.vn'}
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#C9A84C]/15 text-[#DEC47E] border border-[#C9A84C]/30 shrink-0">
            ROOT
          </span>
        </div>
        <button
          type="button"
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
