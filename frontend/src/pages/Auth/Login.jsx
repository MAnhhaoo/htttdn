import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const location = useLocation();
  const { login, isLoggingIn, loginError } = useAuth();
  const [formData, setFormData] = useState({ email: location.state?.email || '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="dark:text-[#F0EDE6]">
      <div className="mb-10">
        <p className="text-[#1A3A2C] dark:text-[#C9A84C] font-bold text-[10px] tracking-widest uppercase mb-3">
          Rất vui được gặp lại bạn
        </p>
        <h2 className="text-[32px] font-medium text-gray-900 dark:text-[#F0EDE6] mb-3 tracking-tight">
          Đăng nhập
        </h2>
        <p className="text-gray-500 dark:text-[#94A89E] text-sm">
          Đăng nhập để tiếp tục hành trình mua sắm của bạn.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {location.state?.registered && (
          <div
            role="status"
            className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 p-3 rounded-lg text-sm text-center font-medium"
          >
            Đăng ký thành công. Vui lòng đăng nhập để tiếp tục.
          </div>
        )}
        {loginError && (
          <div className="bg-red-50 dark:bg-rose-950/40 text-red-500 dark:text-rose-300 border border-red-100 dark:border-rose-800/60 p-3 rounded-lg text-sm text-center font-medium">
            {loginError.response?.data?.message || 'Email hoặc mật khẩu không chính xác'}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-800 dark:text-[#E2DFD7] mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-[18px] w-[18px] text-gray-400 dark:text-[#7F948A]" strokeWidth={1.5} />
            </div>
            <input
              type="email"
              required
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-[#223029] rounded text-sm text-gray-900 dark:text-[#F0EDE6] placeholder:text-gray-400 dark:placeholder:text-[#687D73] transition-colors bg-white dark:bg-[#0B110E] outline-none focus:border-[#1A3A2C] dark:focus:border-[#C9A84C] focus:ring-1 focus:ring-[#1A3A2C] dark:focus:ring-[#C9A84C]"
              placeholder="ban@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 dark:text-[#E2DFD7] mb-2">
            Mật khẩu
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-[18px] w-[18px] text-gray-400 dark:text-[#7F948A]" strokeWidth={1.5} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-[#223029] rounded text-sm text-gray-900 dark:text-[#F0EDE6] placeholder:text-gray-400 dark:placeholder:text-[#687D73] transition-colors bg-white dark:bg-[#0B110E] outline-none focus:border-[#1A3A2C] dark:focus:border-[#C9A84C] focus:ring-1 focus:ring-[#1A3A2C] dark:focus:ring-[#C9A84C]"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff
                  className="h-[18px] w-[18px] text-gray-400 hover:text-gray-600 dark:text-[#7F948A] dark:hover:text-[#F0EDE6]"
                  strokeWidth={1.5}
                />
              ) : (
                <Eye
                  className="h-[18px] w-[18px] text-gray-400 hover:text-gray-600 dark:text-[#7F948A] dark:hover:text-[#F0EDE6]"
                  strokeWidth={1.5}
                />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 pb-4">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 dark:border-[#223029] text-[#1A3A2C] dark:text-[#C9A84C] focus:ring-[#1A3A2C] dark:focus:ring-[#C9A84C] bg-white dark:bg-[#0B110E] cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              className="ml-2.5 block text-[13px] text-gray-600 dark:text-[#94A89E] cursor-pointer"
            >
              Ghi nhớ đăng nhập
            </label>
          </div>

          <div className="text-[13px]">
            <a
              href="#"
              className="font-bold text-[#1A3A2C] dark:text-[#C9A84C] hover:opacity-80 transition-opacity"
            >
              Quên mật khẩu?
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-2 bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#C9A84C] dark:hover:bg-[#B08A2E] text-white dark:text-[#08130E] py-3.5 px-4 rounded-sm font-bold text-sm transition-colors disabled:opacity-70"
        >
          {isLoggingIn ? 'Đang xử lý...' : 'Đăng nhập'}
          {!isLoggingIn && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
        </button>
      </form>

      <p className="mt-8 text-center text-[13px] text-gray-600 dark:text-[#94A89E]">
        Bạn chưa có tài khoản?{' '}
        <Link
          to="/register"
          className="font-bold text-[#1A3A2C] dark:text-[#C9A84C] hover:opacity-80 transition-opacity"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
