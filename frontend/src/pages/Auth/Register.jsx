import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, MapPin } from 'lucide-react';

export default function Register() {
  const { register, isRegistering, registerError } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <>
      <div className="">
        <p className="text-[#1a4f40] font-bold text-[10px] tracking-widest uppercase mb-3">Bắt đầu cùng miva</p>
        <h2 className="text-[32px] font-medium text-gray-900 mb-3 tracking-tight">
          Tạo tài khoản
        </h2>
        <p className="text-gray-500 text-sm">
          Đăng ký để khám phá những điều dành riêng cho bạn.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {registerError && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-medium">
            {registerError.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">Họ và Tên</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <User className="h-[18px] w-[18px] text-gray-400" strokeWidth={1.5} />
            </div>
            <input
              required
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded text-sm transition-colors bg-white outline-none focus:border-[#1a4f40] focus:ring-1 focus:ring-[#1a4f40]"
              placeholder="Nguyễn Minh Anh"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
        </div>

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
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">Số điện thoại</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Phone className="h-[18px] w-[18px] text-gray-400" strokeWidth={1.5} />
            </div>
            <input
              required
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded text-sm transition-colors bg-white outline-none focus:border-[#1a4f40] focus:ring-1 focus:ring-[#1a4f40]"
              placeholder="0912 345 678"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">Địa chỉ</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <MapPin className="h-[18px] w-[18px] text-gray-400" strokeWidth={1.5} />
            </div>
            <input
              required
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded text-sm transition-colors bg-white outline-none focus:border-[#1a4f40] focus:ring-1 focus:ring-[#1a4f40]"
              placeholder="Nhập địa chỉ của bạn"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
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
              onChange={e => setFormData({ ...formData, password: e.target.value })}
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

        <div className="flex items-start pt-2 pb-2">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              required
              className="h-4 w-4 rounded border-gray-300 text-[#1a4f40] focus:ring-[#1a4f40] bg-white cursor-pointer"
            />
          </div>
          <div className="ml-2.5 text-[11px] text-gray-600">
            <label htmlFor="terms" className="cursor-pointer">
              Tôi đồng ý với <a href="#" className="font-bold text-gray-800 hover:underline">Điều khoản sử dụng</a> và <a href="#" className="font-bold text-gray-800 hover:underline">Chính sách bảo mật</a> của MIVA.
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isRegistering}
          className="w-full flex items-center justify-center gap-2 bg-[#1a4f40] text-white py-3.5 px-4 rounded-sm font-bold text-sm hover:bg-[#133c30] transition-colors disabled:opacity-70 mt-2"
        >
          {isRegistering ? 'Đang xử lý...' : 'Tạo tài khoản'}
          {!isRegistering && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
        </button>
      </form>

      <p className="mt-8 text-center text-[13px] text-gray-600">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-bold text-[#1a4f40] hover:opacity-80 transition-opacity">
          Đăng nhập
        </Link>
      </p>
    </>
  );
}
