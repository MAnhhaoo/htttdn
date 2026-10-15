import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/25 mb-4">
          M
        </div>

        {/* Portal Title */}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Cổng Nhân Viên MIVA
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Hệ thống thông tin nội bộ & vận hành đơn hàng sàn MIVA
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-200 dark:border-slate-800 sm:px-8">
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
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Đang xác thực thông tin...' : 'Đăng Nhập Cổng Nhân Viên'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Security Assurance */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Khu vực giới hạn nội bộ • Bảo mật xác thực sàn MIVA</span>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
          © 2026 MIVA E-Commerce Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
};
