import { useState } from 'react';
import { Store, Eye, EyeOff, Loader2, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function VendorLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: location.state?.email || '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg[0]);
      } else if (typeof msg === 'string') {
        setError(msg);
      } else {
        setError('Email hoặc mật khẩu không chính xác');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#07120D] flex items-center justify-center p-4 font-sans">
      {/* MIVA Deep Forest & Champagne Gold Aurora Mesh */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-36 -left-36 w-[560px] h-[560px] rounded-full bg-[#1A3A2C]/65 blur-[140px]" />
        <div className="absolute top-1/4 -right-36 w-[520px] h-[520px] rounded-full bg-[#C9A84C]/20 blur-[145px]" />
        <div className="absolute -bottom-40 left-1/3 w-[540px] h-[540px] rounded-full bg-[#2A5C4A]/40 blur-[150px]" />
        <div className="absolute top-20 right-1/3 w-[320px] h-[320px] rounded-full bg-[#B08A2E]/15 blur-[120px]" />

        {/* Architectural Luxury Commerce Lattice */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #C9A84C 1px, transparent 1px), linear-gradient(to bottom, #C9A84C 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full border border-[#C9A84C]/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[980px] h-[980px] rounded-full border border-dashed border-[#2A5C4A]/25" />
      </div>

      {/* Floating Partner Ecosystem Badges (Desktop) */}
      <div className="hidden lg:flex items-center gap-2.5 absolute top-8 left-8 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-xl border border-[#C9A84C]/25 text-xs text-[#E8F0EC] shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
        <span className="font-semibold text-white">MIVA Kênh Người Bán</span>
        <span className="text-[#C9A84C]/70">•</span>
        <span className="text-[#DEC47E]">Hệ sinh thái Đối tác Chính thức</span>
      </div>

      <div className="hidden lg:flex items-center justify-between absolute bottom-8 inset-x-8 text-xs text-[#C7D6CE]/85 pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tăng trưởng doanh thu đa kênh &amp; phân tích thông minh</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-[#C9A84C]/20 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
          <span>Đối soát minh bạch • Bảo vệ quyền lợi nhà bán hàng</span>
        </div>
      </div>

      {/* Main Frosted Glass Login Card */}
      <div className="max-w-md w-full bg-white/95 dark:bg-[#131B17]/95 backdrop-blur-2xl transition-colors rounded-3xl shadow-[0_25px_70px_-15px_rgba(7,18,13,0.75)] border border-white/30 dark:border-[#223029] ring-1 ring-[#C9A84C]/25 p-8 sm:p-10 relative z-10 overflow-hidden">
        {/* Top Luminous Gradient Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#1A3A2C] via-[#C9A84C] to-[#2A5C4A]" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#9E7B23] text-[#08130E] mb-4 shadow-xl shadow-[#C9A84C]/25 ring-4 ring-[#C9A84C]/15">
            <Store className="w-8 h-8 text-[#08130E] stroke-[2.1]" />
          </div>
          <div className="mb-1.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#C9A84C]/15 text-[#9E7B23] dark:text-[#DEC47E] border border-[#C9A84C]/35">
              MIVA PARTNER
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            MIVA Kênh Người Bán
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Đăng nhập Quản lý Gian hàng
          </p>
        </div>

        {location.state?.registered && (
          <div
            role="status"
            className="mb-6 p-4 bg-[#EEF5F1] dark:bg-[#1A3A2C]/40 text-[#1A3A2C] dark:text-emerald-300 text-sm rounded-xl border border-[#2A5C4A]/25 dark:border-[#2A5C4A]/60"
          >
            Đăng ký gian hàng thành công. Vui lòng chờ Ban Quản Trị MIVA duyệt hồ sơ trước khi đăng nhập.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm rounded-xl border border-rose-200 dark:border-rose-900/60">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email đăng nhập"
            type="email"
            placeholder="vendor@shop.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="focus:ring-[#1A3A2C] dark:focus:ring-[#C9A84C]"
          />

          <div className="relative">
            <Input
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-[28px] p-1 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-[#1A3A2C] focus:ring-[#1A3A2C]"
              />
              <span className="text-slate-600 dark:text-slate-400">Ghi nhớ đăng nhập</span>
            </label>
            <a
              href="#"
              className="text-[#1A3A2C] hover:text-[#2A5C4A] dark:text-[#DEC47E] dark:hover:text-[#C9A84C] font-medium"
            >
              Quên mật khẩu?
            </a>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base mt-2 rounded-xl bg-gradient-to-r from-[#1A3A2C] to-[#2A5C4A] hover:from-[#142D22] hover:to-[#1A3A2C] dark:from-[#2A5C4A] dark:to-[#35755B] text-white shadow-lg shadow-[#1A3A2C]/30 flex items-center justify-center gap-2 font-semibold"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Đăng nhập Quản lý Gian hàng'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Chưa có gian hàng trên MIVA?{' '}
          <Link
            to="/register"
            className="text-[#1A3A2C] hover:text-[#2A5C4A] dark:text-[#DEC47E] dark:hover:text-[#C9A84C] font-semibold"
          >
            Đăng ký Đối tác tại đây
          </Link>
        </p>
      </div>
    </div>
  );
}
