import { useState } from 'react';
import { Shield, Eye, EyeOff, Loader2, Lock, Activity, Cpu } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-[#060b19]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
    <div className="min-h-screen relative overflow-hidden bg-[#050b18] flex items-center justify-center p-4">
      {/* Cyber-Enterprise Aurora Mesh Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full bg-blue-600/30 blur-[140px]" />
        <div className="absolute top-1/4 -right-36 w-[500px] h-[500px] rounded-full bg-indigo-600/30 blur-[140px]" />
        <div className="absolute -bottom-44 left-1/3 w-[560px] h-[560px] rounded-full bg-cyan-500/20 blur-[150px]" />

        {/* Perspective Grid Matrix */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #60a5fa 1px, transparent 1px), linear-gradient(to bottom, #60a5fa 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        {/* Orbital Command Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] rounded-full border border-blue-500/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[920px] rounded-full border border-dashed border-indigo-400/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1160px] h-[1160px] rounded-full border border-cyan-500/5" />
      </div>

      {/* Floating Command Center Badges (Desktop) */}
      <div className="hidden lg:flex items-center gap-2.5 absolute top-8 left-8 px-4 py-2 rounded-full bg-slate-900/70 backdrop-blur-xl border border-blue-500/20 text-xs text-slate-300 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-medium text-white">MIVA Core Command</span>
        <span className="text-slate-500">•</span>
        <span className="text-blue-400 font-mono text-[11px]">SYS-ONLINE</span>
      </div>

      <div className="hidden lg:flex items-center gap-4 absolute bottom-8 inset-x-8 justify-between text-xs text-slate-400/80 pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Zero-Trust Admin Gateway • 256-bit TLS</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Realtime Telemetry Active</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>MIVA Enterprise v2.6</span>
          </div>
        </div>
      </div>

      {/* Main Frosted Glass Login Card */}
      <div className="max-w-md w-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl transition-colors rounded-3xl shadow-[0_25px_70px_-15px_rgba(37,99,235,0.45)] border border-white/30 dark:border-slate-700/80 ring-1 ring-blue-500/20 p-8 sm:p-10 relative z-10 overflow-hidden">
        {/* Top Luminous Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600" />

        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white mb-4 shadow-xl shadow-blue-500/35 ring-4 ring-blue-500/15">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Admin Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">Sign in to manage the system</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="admin@example.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
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
              <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-slate-600 dark:text-slate-400">Remember me</span>
            </label>
          </div>

          <Button type="submit" variant="primary" className="w-full h-12 text-base mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/25" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang đăng nhập...
              </span>
            ) : (
              'Sign In to Dashboard'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
