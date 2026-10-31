import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, ShieldCheck, Truck, Crown, Star } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex font-sans bg-[#faf7f2] relative overflow-hidden">
      {/* Ambient background for mobile & right-side bleed */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-[#cca471]/20 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full bg-[#1a4f40]/10 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(#1a4f40 0.65px, transparent 0.65px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Left Side - Luxury Editorial Banner */}
      <div className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-[#0a231b] via-[#154235] to-[#0d2d23] text-white flex-col justify-between p-12 xl:p-16 relative overflow-hidden shadow-2xl z-10">
        {/* Aurora Mesh Glows */}
        <div className="pointer-events-none absolute -top-28 -left-28 w-[520px] h-[520px] rounded-full bg-emerald-400/15 blur-[130px]" />
        <div className="pointer-events-none absolute top-1/3 -right-24 w-[460px] h-[460px] rounded-full bg-[#cca471]/25 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full bg-teal-300/10 blur-[130px]" />

        {/* Architectural Grid & Luxury Gold Rings */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div className="pointer-events-none absolute top-[-18%] right-[-12%] w-[640px] h-[640px] rounded-full border border-[#cca471]/25" />
        <div className="pointer-events-none absolute top-[-12%] right-[-6%] w-[480px] h-[480px] rounded-full border border-dashed border-white/15" />
        <div className="pointer-events-none absolute top-[22%] left-[-22%] w-[780px] h-[780px] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute bottom-14 right-16 w-36 h-36 rounded-full bg-gradient-to-tr from-[#cca471]/40 to-[#f3dfc1]/20 backdrop-blur-md border border-[#cca471]/40 shadow-2xl" />
        <div className="pointer-events-none absolute top-36 right-1/4 w-4 h-4 rounded-full bg-[#cca471] shadow-[0_0_25px_6px_rgba(204,164,113,0.6)]" />
        <div className="pointer-events-none absolute bottom-1/3 left-16 w-2.5 h-2.5 rounded-full bg-emerald-300 shadow-[0_0_20px_4px_rgba(110,231,183,0.5)]" />

        {/* Header */}
        <div className="flex justify-between items-center relative z-10">
          <Link to="/" className="group flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#cca471] font-serif font-bold text-lg shadow-inner">
              M
            </span>
            <span className="text-sm font-bold tracking-[0.35em] text-white">
              MI <span className="text-[#cca471]">V</span> A
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-white/90 hover:text-white transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Về trang chủ
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-xl my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#cca471]/15 border border-[#cca471]/35 text-[#f0d5a8] font-bold text-[10px] tracking-[0.2em] uppercase mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#cca471]" /> CHÀO MỪNG ĐẾN MIVA
          </div>
          <h1 className="text-[58px] xl:text-[66px] font-medium mb-6 leading-[1.08] tracking-tight text-white drop-shadow-sm">
            Everything
            <br />
            <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#f5e3c3] via-[#cca471] to-[#e8c99b]">
              You Need.
            </span>
          </h1>
          <p className="text-white/80 text-base xl:text-lg max-w-md leading-relaxed mb-10 font-light">
            Mọi điều bạn cần, trong một trải nghiệm mua sắm tinh tế, hiện đại và thật dễ dàng.
          </p>

          {/* Floating Glassmorphic Showcase Card */}
          <div className="p-5 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.25)] max-w-md">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#cca471] to-[#9e7642] border-2 border-[#12382c] flex items-center justify-center text-[10px] font-bold">
                    VIP
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 border-2 border-[#12382c] flex items-center justify-center text-[10px] font-bold">
                    M+
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Cộng đồng Mua sắm Tinh hoa</div>
                  <div className="text-[11px] text-white/65">Hơn 50.000+ khách hàng tin chọn</div>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#cca471]/20 border border-[#cca471]/30 text-[#f5e3c3] text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-[#cca471] text-[#cca471]" /> 4.9
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-[11px] text-white/85">
              <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-2 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-[#cca471] shrink-0" />
                <span className="truncate">100% Chính hãng</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-2 border border-white/10">
                <Truck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span className="truncate">Giao hỏa tốc</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-2 border border-white/10">
                <Crown className="w-3.5 h-3.5 text-[#cca471] shrink-0" />
                <span className="truncate">Ưu đãi Độc quyền</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-[10px] text-white/45 tracking-[0.2em] uppercase">
          <span>THIẾT KẾ CHO NHỮNG ĐIỀU THƯỜNG NGÀY.</span>
          <span className="text-[#cca471]/80">MIVA BOUTIQUE © 2026</span>
        </div>
      </div>

      {/* Right Side - Form Container with Luxury Ambient Background */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-10 lg:p-14 relative overflow-y-auto max-h-screen z-10">
        {/* Decorative warm glow rings behind form card */}
        <div className="pointer-events-none absolute top-12 right-12 w-64 h-64 rounded-full bg-gradient-to-br from-[#cca471]/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute bottom-12 left-12 w-72 h-72 rounded-full bg-gradient-to-tr from-[#1a4f40]/15 to-transparent blur-3xl" />

        <div className="w-full max-w-[460px] bg-white/85 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-[0_24px_60px_-15px_rgba(26,79,64,0.14)] border border-white/90 ring-1 ring-[#1a4f40]/10 relative">
          {/* Subtle top gold/emerald accent bar */}
          <div className="absolute top-0 inset-x-10 h-1 rounded-b-full bg-gradient-to-r from-transparent via-[#1a4f40] to-transparent opacity-75" />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
