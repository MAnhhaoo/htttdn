import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, Truck, Clock } from 'lucide-react';

export const LoginPage = () => {
  const { login, isLoading } = useAuth();
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
      setError(res.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại email và mật khẩu.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#040d1a] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      {/* Operational Sapphire & Teal Aurora Mesh Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[540px] h-[540px] rounded-full bg-blue-600/30 blur-[140px]" />
        <div className="absolute top-1/3 -right-36 w-[520px] h-[520px] rounded-full bg-teal-500/25 blur-[140px]" />
        <div className="absolute -bottom-44 left-1/3 w-[560px] h-[560px] rounded-full bg-indigo-600/25 blur-[150px]" />

        {/* Technical Blueprint Dot & Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
        />

        {/* Orbital Radar Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[660px] h-[660px] rounded-full border border-sky-400/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[920px] rounded-full border border-dashed border-teal-400/10" />
      </div>

      {/* Floating Operational Status Badges (Desktop) */}
      <div className="hidden lg:flex items-center gap-2.5 absolute top-8 left-8 px-4 py-2 rounded-full bg-slate-900/75 backdrop-blur-xl border border-sky-500/20 text-xs text-slate-200 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        <span className="font-semibold">MIVA Operations Hub</span>
        <span className="text-slate-500">•</span>
        <span className="text-sky-400">Internal Workspace</span>
      </div>

      <div className="hidden lg:flex items-center justify-between absolute bottom-8 inset-x-8 text-xs text-slate-300/75 pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <Truck className="w-3.5 h-3.5 text-teal-400" />
          <span>Điều phối đơn hàng & vận chuyển nội bộ thời gian thực</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>Chấm công • Phân ca • Giám sát SLA 24/7</span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        {/* Brand Icon */}
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-teal-400 items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/35 ring-4 ring-sky-400/20 mb-4">
          M
        </div>

        {/* Portal Title */}
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Cổng Nhân Viên MIVA
        </h1>
        <p className="mt-1.5 text-sm text-slate-300/85">
          Hệ thống thông tin nội bộ & vận hành đơn hàng sàn MIVA
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl py-8 px-6 shadow-[0_25px_70px_-15px_rgba(14,165,233,0.38)] rounded-3xl border border-white/30 dark:border-slate-700/80 ring-1 ring-sky-500/20 sm:px-9 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-teal-400" />

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
                  className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
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
                  className="w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
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
                  className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-700 rounded focus:ring-blue-500"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>

              <span className="text-xs text-slate-400 dark:text-slate-500 cursor-default" title="Liên hệ Quản trị viên để đặt lại mật khẩu">
                Quên mật khẩu?
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 hover:from-blue-700 hover:to-teal-600 active:scale-[0.99] transition shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Đang xác thực thông tin...' : 'Đăng Nhập Cổng Nhân Viên'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Security Assurance */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Khu vực giới hạn nội bộ • Bảo mật xác thực sàn MIVA</span>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-slate-400/80">
          © 2026 MIVA E-Commerce Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
};
