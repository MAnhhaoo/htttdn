import { useState } from 'react';
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Truck,
  Clock,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (!res.success) {
      setError(
        res.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại email và mật khẩu.',
      );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#07120D] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      {/* Unified MIVA Deep Forest & Champagne Gold Aurora Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[540px] h-[540px] rounded-full bg-[#1A3A2C]/65 blur-[140px]" />
        <div className="absolute top-1/3 -right-36 w-[520px] h-[520px] rounded-full bg-[#C9A84C]/20 blur-[140px]" />
        <div className="absolute -bottom-44 left-1/3 w-[560px] h-[560px] rounded-full bg-[#2A5C4A]/45 blur-[150px]" />

        {/* Architectural Gold Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #C9A84C 1px, transparent 1px), linear-gradient(to bottom, #C9A84C 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
        />

        {/* Orbital Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[660px] h-[660px] rounded-full border border-[#2A5C4A]/35" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[920px] rounded-full border border-dashed border-[#C9A84C]/15" />
      </div>

      {/* Floating Operational Status Badges (Desktop) */}
      <div className="hidden lg:flex items-center gap-2.5 absolute top-8 left-8 px-4 py-2 rounded-full bg-[#0E2219]/85 backdrop-blur-xl border border-[#C9A84C]/25 text-xs text-[#E2ECE7] shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold">MIVA Operations Hub</span>
        <span className="text-[#5C7A6C]">•</span>
        <span className="text-[#DEC47E] font-medium">Internal Workspace</span>
      </div>

      {/* Theme Toggle on Login */}
      <button
        type="button"
        onClick={toggleTheme}
        title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
        className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-[#0E2219]/85 hover:bg-[#142F23] border border-[#C9A84C]/25 text-[#DEC47E] backdrop-blur-xl transition cursor-pointer"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="hidden lg:flex items-center justify-between absolute bottom-8 inset-x-8 text-xs text-[#B9D6C6]/85 pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E2219]/65 border border-[#1E3B2E] backdrop-blur-md">
          <Truck className="w-3.5 h-3.5 text-[#DEC47E]" />
          <span>Điều phối đơn hàng &amp; vận chuyển nội bộ thời gian thực</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E2219]/65 border border-[#1E3B2E] backdrop-blur-md">
          <Clock className="w-3.5 h-3.5 text-[#8BBAA1]" />
          <span>Chấm công • Phân ca • Giám sát SLA 24/7</span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        {/* Brand Icon */}
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A84C] via-[#DFC06B] to-[#9E7B23] items-center justify-center text-[#08130E] font-black text-2xl shadow-xl shadow-[#C9A84C]/25 ring-4 ring-[#C9A84C]/20 mb-4">
          M
        </div>

        {/* Portal Title */}
        <h1 className="text-2xl font-bold text-white tracking-tight">Cổng Nhân Viên MIVA</h1>
        <p className="mt-1.5 text-sm text-[#A3B8AE]">
          Hệ thống thông tin nội bộ &amp; vận hành đơn hàng sàn MIVA
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 dark:bg-[#131B17]/95 backdrop-blur-2xl py-8 px-6 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.65)] rounded-3xl border border-white/25 dark:border-[#1E3B2E] ring-1 ring-[#C9A84C]/20 sm:px-9 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#1A3A2C] via-[#C9A84C] to-[#2A5C4A]" />

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Email nhân viên nội bộ
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@miva.vn"
                  className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#243B2F] bg-white dark:bg-[#0D1511] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2A5C4A]/25 focus:border-[#2A5C4A] dark:focus:border-[#C9A84C] transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn..."
                  className="w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-[#243B2F] bg-white dark:bg-[#0D1511] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2A5C4A]/25 focus:border-[#2A5C4A] dark:focus:border-[#C9A84C] transition"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-0.5"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-[#1A3A2C] dark:accent-[#C9A84C] border-slate-300 dark:border-slate-700 rounded focus:ring-[#2A5C4A]"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>

              <span
                className="text-xs text-slate-400 dark:text-slate-500 cursor-default"
                title="Liên hệ Quản trị viên để đặt lại mật khẩu"
              >
                Quên mật khẩu?
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#1A3A2C] via-[#234D3B] to-[#2A5C4A] hover:from-[#234D3B] hover:to-[#35755B] border border-[#C9A84C]/30 active:scale-[0.99] transition shadow-lg shadow-[#08130E]/35 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Đang xác thực thông tin...' : 'Đăng Nhập Cổng Nhân Viên'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4 text-[#DEC47E]" />}
            </button>
          </form>

          {/* Security Assurance */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#1E3B2E] flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2A5C4A] dark:text-[#DEC47E]" />
            <span>Khu vực giới hạn nội bộ • Bảo mật xác thực sàn MIVA</span>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-[#7FA090]">
          © 2026 MIVA E-Commerce Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
};
