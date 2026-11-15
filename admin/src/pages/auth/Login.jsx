import { useState } from 'react';
import { Crown, Eye, EyeOff, Loader2, Lock, Activity, Cpu } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Đang check auth, hiển thị loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07120D]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A84C]"></div>
      </div>
    );
  }

  // Nếu đã đăng nhập, redirect về dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen relative overflow-hidden bg-[#07120D] flex items-center justify-center p-4">
      {/* MIVA Deep Forest & Champagne Gold Aurora Mesh Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full bg-[#1A3A2C]/40 blur-[140px]" />
        <div className="absolute top-1/4 -right-36 w-[500px] h-[500px] rounded-full bg-[#C9A84C]/15 blur-[140px]" />
        <div className="absolute -bottom-44 left-1/3 w-[560px] h-[560px] rounded-full bg-[#2A5C4A]/25 blur-[150px]" />

        {/* Subtle Luxury Grid Matrix */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #C9A84C 1px, transparent 1px), linear-gradient(to bottom, #C9A84C 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        {/* Orbital Command Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] rounded-full border border-[#C9A84C]/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[920px] rounded-full border border-dashed border-[#2A5C4A]/25" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1160px] h-[1160px] rounded-full border border-[#C9A84C]/5" />
      </div>

      {/* Floating Command Center Badges (Desktop) */}
      <div className="hidden lg:flex items-center gap-2.5 absolute top-8 left-8 px-4 py-2 rounded-full bg-[#0E1D16]/85 backdrop-blur-xl border border-[#C9A84C]/20 text-xs text-[#C5D6CE] shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-white">MIVA Core Command</span>
        <span className="text-[#5B7568]">•</span>
        <span className="text-[#C9A84C] font-mono text-[11px]">SYS-ONLINE</span>
      </div>

      <div className="hidden lg:flex items-center gap-4 absolute bottom-8 inset-x-8 justify-between text-xs text-[#8AA398] pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E1D16]/70 border border-[#C9A84C]/15 backdrop-blur-md">
          <Lock className="w-3.5 h-3.5 text-[#C9A84C]" />
          <span>Zero-Trust Admin Gateway • 256-bit TLS</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0E1D16]/70 border border-[#C9A84C]/15 backdrop-blur-md">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Realtime Telemetry Active</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0E1D16]/70 border border-[#C9A84C]/15 backdrop-blur-md">
            <Cpu className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>MIVA Enterprise v2.6</span>
          </div>
        </div>
      </div>

      {/* Main Frosted Glass Login Card */}
      <div className="max-w-md w-full bg-[#0E1D16]/85 backdrop-blur-2xl transition-colors rounded-3xl shadow-[0_25px_70px_-15px_rgba(4,12,8,0.85)] border border-[#C9A84C]/20 ring-1 ring-[#C9A84C]/10 p-8 sm:p-10 relative z-10 overflow-hidden">
        {/* Top Luminous Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#1A3A2C] via-[#C9A84C] to-[#2A5C4A]" />

        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#9E7B23] text-[#08130E] mb-4 shadow-xl shadow-[#C9A84C]/25 ring-4 ring-[#C9A84C]/15">
            <Crown className="w-8 h-8 text-[#08130E] stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">MIVA Admin Portal</h1>
          <p className="text-[#A3B8AE] mt-1.5 text-sm">Đăng nhập Cổng Quản trị Sàn Thương mại</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-950/60 text-rose-200 text-sm rounded-xl border border-rose-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Địa chỉ Email"
            type="email"
            placeholder="admin@miva.vn"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="bg-[#09140F]/90 border-[#1E3B2E] text-white placeholder:text-[#688276] focus:border-[#C9A84C]/60 focus:ring-[#C9A84C]/25"
            required
          />

          <div className="relative">
            <Input
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-[#09140F]/90 border-[#1E3B2E] text-white placeholder:text-[#688276] focus:border-[#C9A84C]/60 focus:ring-[#C9A84C]/25 pr-10"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-[28px] p-1 text-[#8AA398] hover:text-[#DEC47E] transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-[#2A5C4A] bg-[#09140F] text-[#C9A84C] focus:ring-[#C9A84C]/25"
              />
              <span className="text-[#A3B8AE]">Ghi nhớ phiên đăng nhập</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-12 text-base mt-2 rounded-xl bg-gradient-to-r from-[#1A3A2C] to-[#2A5C4A] hover:from-[#234B3A] hover:to-[#35755B] border border-[#C9A84C]/30 text-white shadow-lg shadow-black/30"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#C9A84C]" />
                Đang đăng nhập...
              </span>
            ) : (
              'Đăng nhập Hệ thống'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
