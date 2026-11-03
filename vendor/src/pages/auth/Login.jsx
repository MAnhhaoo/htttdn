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
    <div className="min-h-screen relative overflow-hidden bg-[#0b0820] flex items-center justify-center p-4">
      {/* Merchant Growth Indigo-Violet & Amber Aurora Mesh */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-36 -left-36 w-[540px] h-[540px] rounded-full bg-indigo-600/35 blur-[140px]" />
        <div className="absolute top-1/4 -right-36 w-[520px] h-[520px] rounded-full bg-purple-600/30 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[520px] h-[520px] rounded-full bg-fuchsia-500/20 blur-[150px]" />
        <div className="absolute top-20 right-1/3 w-[320px] h-[320px] rounded-full bg-amber-500/15 blur-[120px]" />

        {/* Geometric Commerce Lattice */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #a78bfa 1px, transparent 1px), linear-gradient(to bottom, #a78bfa 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full border border-indigo-400/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[980px] h-[980px] rounded-full border border-dashed border-purple-400/10" />
      </div>

      {/* Floating Partner Ecosystem Badges (Desktop) */}
      <div className="hidden lg:flex items-center gap-2.5 absolute top-8 left-8 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/15 text-xs text-indigo-100 shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-semibold">MIVA Partner Ecosystem</span>
        <span className="text-indigo-300/60">•</span>
        <span className="text-indigo-200">Kênh Người Bán Chính Thức</span>
      </div>

      <div className="hidden lg:flex items-center justify-between absolute bottom-8 inset-x-8 text-xs text-indigo-200/75 pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tăng trưởng doanh thu đa kênh & phân tích thông minh</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Đối soát minh bạch • Bảo vệ quyền lợi nhà bán hàng</span>
        </div>
      </div>

      {/* Main Frosted Glass Login Card */}
      <div className="max-w-md w-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl transition-colors rounded-3xl shadow-[0_25px_70px_-15px_rgba(99,102,241,0.45)] border border-white/30 dark:border-slate-700/80 ring-1 ring-indigo-500/20 p-8 sm:p-10 relative z-10 overflow-hidden">
        {/* Top Luminous Gradient Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-amber-400" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 text-white mb-4 shadow-xl shadow-indigo-500/35 ring-4 ring-indigo-500/15">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Vendor Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">Sign in to manage your store</p>
        </div>

        {location.state?.registered && (
          <div role="status" className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-100">
            Đăng ký gian hàng thành công. Vui lòng chờ admin duyệt hồ sơ trước khi đăng nhập.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="vendor@shop.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
            className="focus:ring-indigo-500"
          />
          
          <div className="relative">
            <Input 
              label="Password" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button 
              type="button"
              className="absolute right-3 top-[28px] p-1 text-slate-400 hover:text-slate-600 dark:text-slate-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-slate-600 dark:text-slate-400">Remember me</span>
            </label>
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</a>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-12 text-base mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Don't have a store yet? <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">Register here</Link>
        </p>
      </div>
    </div>
  );
}
