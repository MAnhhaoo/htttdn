import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex font-sans bg-[#fbf9f4]">
      {/* Left Side - Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a4f40] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Decorative Circles & Lines (approximations) */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full border-[0.5px] border-white/20" />
        <div className="absolute top-[20%] left-[-20%] w-[800px] h-[800px] rounded-full border-[0.5px] border-white/10" />
        <div className="absolute bottom-10 right-20 w-32 h-32 rounded-full bg-[#cca471]" />
        <div className="absolute top-32 right-1/4 w-5 h-5 rounded-full bg-[#cca471]" />
        
        {/* Header */}
        <div className="flex justify-between items-center relative z-10">
          <Link to="/" className="text-sm font-bold tracking-[0.3em]">
            MI <span className="opacity-50">V</span> A
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Về trang chủ
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg mt-20">
          <div className="flex items-center gap-2 text-white/80 font-bold text-[10px] tracking-widest uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> CHÀO MỪNG ĐẾN MIVA
          </div>
          <h1 className="text-[64px] font-medium mb-6 leading-[1.1] tracking-tight">
            Everything<br/>
            <span className="italic font-light">You Need.</span>
          </h1>
          <p className="text-white/80 text-lg max-w-sm leading-relaxed">
            Mọi điều bạn cần, trong một trải nghiệm mua sắm thật dễ dàng.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[10px] text-white/40 tracking-[0.2em] uppercase">
          THIẾT KẾ CHO NHỮNG ĐIỀU THƯỜNG NGÀY.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative overflow-y-auto max-h-screen">
        <div className="w-full max-w-[440px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
