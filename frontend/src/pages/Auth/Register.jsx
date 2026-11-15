import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  MapPin,
  Calendar,
  Users,
} from "lucide-react";

const GENDER_OPTIONS = [
  { value: "", label: "Chọn giới tính (Tùy chọn)" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
  { value: "prefer_not_to_say", label: "Không muốn tiết lộ" },
];

const INPUT_BASE_CLASS =
  "block w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-[#223029] rounded text-sm text-[#1A3A2C] dark:text-[#F0EDE6] placeholder:text-gray-400 dark:placeholder:text-[#687D73] transition-colors bg-white dark:bg-[#0B110E] outline-none focus:border-[#1A3A2C] dark:focus:border-[#C9A84C] focus:ring-1 focus:ring-[#1A3A2C] dark:focus:ring-[#C9A84C]";

export default function Register() {
  const { register, isRegistering, registerError } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({
        ...formData,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
      });
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="dark:text-[#F0EDE6]">
      <div className="mb-6">
        <p className="text-[#1A3A2C] dark:text-[#C9A84C] font-bold text-[10px] tracking-widest uppercase mb-2">
          Bắt đầu cùng miva
        </p>
        <h2 className="text-[32px] font-medium text-gray-900 dark:text-[#F0EDE6] mb-2 tracking-tight">
          Tạo tài khoản
        </h2>
        <p className="text-gray-500 dark:text-[#94A89E] text-sm">
          Đăng ký để khám phá những điều dành riêng cho bạn.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {registerError && (
          <div className="bg-red-50 dark:bg-rose-950/40 text-red-500 dark:text-rose-300 border border-red-100 dark:border-rose-800/60 p-3 rounded-lg text-sm text-center font-medium">
            {registerError.response?.data?.errors?.[0]?.message ||
              registerError.response?.data?.message ||
              "Đăng ký thất bại. Vui lòng thử lại."}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-800 dark:text-[#E2DFD7] mb-2">
            Họ và Tên
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <User
                className="h-[18px] w-[18px] text-gray-400 dark:text-[#7F948A]"
                strokeWidth={1.5}
              />
            </div>
            <input
              required
              className={INPUT_BASE_CLASS}
              placeholder="Nguyễn Minh Anh"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-800 dark:text-[#E2DFD7] mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail
                  className="h-[18px] w-[18px] text-gray-400 dark:text-[#7F948A]"
                  strokeWidth={1.5}
                />
              </div>
              <input
                type="email"
                required
                className={INPUT_BASE_CLASS}
                placeholder="ban@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 dark:text-[#E2DFD7] mb-2">
              Số điện thoại
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Phone
                  className="h-[18px] w-[18px] text-gray-400 dark:text-[#7F948A]"
                  strokeWidth={1.5}
                />
              </div>
              <input
                required
                className={INPUT_BASE_CLASS}
                placeholder="0912 345 678"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-800 dark:text-[#E2DFD7] mb-2">
              Ngày sinh
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Calendar
                  className="h-[18px] w-[18px] text-gray-400 dark:text-[#7F948A]"
                  strokeWidth={1.5}
                />
              </div>
              <input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-[#223029] rounded text-sm text-[#1A3A2C] dark:text-[#F0EDE6] dark:[color-scheme:dark] transition-colors bg-white dark:bg-[#0B110E] outline-none focus:border-[#1A3A2C] dark:focus:border-[#C9A84C] focus:ring-1 focus:ring-[#1A3A2C] dark:focus:ring-[#C9A84C]"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 dark:text-[#E2DFD7] mb-2">
              Giới tính
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Users
                  className="h-[18px] w-[18px] text-gray-400 dark:text-[#7F948A]"
                  strokeWidth={1.5}
                />
              </div>
              <select
                className={INPUT_BASE_CLASS}
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
              >
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 dark:text-[#E2DFD7] mb-2">
            Địa chỉ
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <MapPin
                className="h-[18px] w-[18px] text-gray-400 dark:text-[#7F948A]"
                strokeWidth={1.5}
              />
            </div>
            <input
              required
              className={INPUT_BASE_CLASS}
              placeholder="Nhập địa chỉ của bạn"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 dark:text-[#E2DFD7] mb-2">
            Mật khẩu
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock
                className="h-[18px] w-[18px] text-gray-400 dark:text-[#7F948A]"
                strokeWidth={1.5}
              />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-[#223029] rounded text-sm text-[#1A3A2C] dark:text-[#F0EDE6] placeholder:text-gray-400 dark:placeholder:text-[#687D73] transition-colors bg-white dark:bg-[#0B110E] outline-none focus:border-[#1A3A2C] dark:focus:border-[#C9A84C] focus:ring-1 focus:ring-[#1A3A2C] dark:focus:ring-[#C9A84C]"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
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

        <div className="flex items-start pt-2 pb-2">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              required
              className="h-4 w-4 rounded border-gray-300 dark:border-[#223029] text-[#1A3A2C] dark:text-[#C9A84C] focus:ring-[#1A3A2C] dark:focus:ring-[#C9A84C] bg-white dark:bg-[#0B110E] cursor-pointer"
            />
          </div>
          <div className="ml-2.5 text-[11px] text-gray-600 dark:text-[#94A89E]">
            <label htmlFor="terms" className="cursor-pointer">
              Tôi đồng ý với{" "}
              <a
                href="#"
                className="font-bold text-gray-800 dark:text-[#C9A84C] hover:underline"
              >
                Điều khoản sử dụng
              </a>{" "}
              và{" "}
              <a
                href="#"
                className="font-bold text-gray-800 dark:text-[#C9A84C] hover:underline"
              >
                Chính sách bảo mật
              </a>{" "}
              của MIVA.
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isRegistering}
          className="w-full flex items-center justify-center gap-2 bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#C9A84C] dark:hover:bg-[#B08A2E] text-white dark:text-[#08130E] py-3.5 px-4 rounded-sm font-bold text-sm transition-colors disabled:opacity-70 mt-2"
        >
          {isRegistering ? "Đang xử lý..." : "Tạo tài khoản"}
          {!isRegistering && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-gray-600 dark:text-[#94A89E]">
        Đã có tài khoản?{" "}
        <Link
          to="/login"
          className="font-bold text-[#1A3A2C] dark:text-[#C9A84C] hover:opacity-80 transition-opacity"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
