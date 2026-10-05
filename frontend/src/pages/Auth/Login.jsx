import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <>
      <div className="mb-10">
        <p className="text-[#1a4f40] font-bold text-[10px] tracking-widest uppercase mb-3">Rất vui được gặp lại bạn</p>
        <h2 className="text-[32px] font-medium text-gray-900 mb-3 tracking-tight">
          Đăng nhập
        </h2>
        <p className="text-gray-500 text-sm">
          Đăng nhập để tiếp tục hành trình mua sắm của bạn.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {loginError && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-medium">
            {loginError.response?.data?.message || 'Email hoặc mật khẩu không chính xác'}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-[18px] w-[18px] text-gray-400" strokeWidth={1.5} />
            </div>
            <input
              type="email"
              required
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded text-sm transition-colors bg-white outline-none focus:border-[#1a4f40] focus:ring-1 focus:ring-[#1a4f40]"
              placeholder="ban@email.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">Mật khẩu</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-[18px] w-[18px] text-gray-400" strokeWidth={1.5} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded text-sm transition-colors bg-white outline-none focus:border-[#1a4f40] focus:ring-1 focus:ring-[#1a4f40]"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px] text-gray-400 hover:text-gray-600" strokeWidth={1.5} />
              ) : (
                <Eye className="h-[18px] w-[18px] text-gray-400 hover:text-gray-600" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 pb-4">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-[#1a4f40] focus:ring-[#1a4f40] bg-white cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2.5 block text-[13px] text-gray-600 cursor-pointer">
              Ghi nhớ đăng nhập
            </label>
          </div>

          <div className="text-[13px]">
            <a href="#" className="font-bold text-[#1a4f40] hover:opacity-80 transition-opacity">
              Quên mật khẩu?
            </a>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-2 bg-[#1a4f40] text-white py-3.5 px-4 rounded-sm font-bold text-sm hover:bg-[#133c30] transition-colors disabled:opacity-70"
        >
          {isLoggingIn ? 'Đang xử lý...' : 'Đăng nhập'} 
          {!isLoggingIn && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
        </button>
      </form>

      <p className="mt-8 text-center text-[13px] text-gray-600">
        Bạn chưa có tài khoản?{' '}
        <Link to="/register" className="font-bold text-[#1a4f40] hover:opacity-80 transition-opacity">
          Đăng ký ngay
        </Link>
      </p>
    </>
  );
}
