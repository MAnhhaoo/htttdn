import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full transition-colors duration-500">
      
      {/* ── Features / Benefits Section ── */}
      <div className="bg-[#FAF7F2] dark:bg-dark-bg border-y border-light-border dark:border-dark-border">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E2F2E9] text-[#2A5C4A] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A3A2C] dark:text-dark-text mb-1">Giao hàng miễn phí</h3>
                <p className="text-sm text-gray-500 dark:text-dark-muted">Cho đơn hàng từ 499K</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E2F2E9] text-[#2A5C4A] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A3A2C] dark:text-dark-text mb-1">Thanh toán an toàn</h3>
                <p className="text-sm text-gray-500 dark:text-dark-muted">Bảo mật 100% thông tin</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E2F2E9] text-[#2A5C4A] flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A3A2C] dark:text-dark-text mb-1">Đổi trả dễ dàng</h3>
                <p className="text-sm text-gray-500 dark:text-dark-muted">Trong vòng 30 ngày</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E2F2E9] text-[#2A5C4A] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A3A2C] dark:text-dark-text mb-1">Sản phẩm tuyển chọn</h3>
                <p className="text-sm text-gray-500 dark:text-dark-muted">Chất lượng được đảm bảo</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Main Footer ── */}
      <div className="bg-[#1A3A2C] text-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
            
            <div className="md:col-span-5 lg:col-span-4">
              <h2 className="text-3xl font-black mb-6 tracking-[0.2em] uppercase">MIVA</h2>
              <p className="text-sm text-white/70 leading-relaxed font-light mb-8 max-w-sm">
                Everything You Need — mọi điều bạn cần, trong một điểm đến.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#1A3A2C] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#1A3A2C] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              </div>
            </div>
            
            <div className="md:col-span-3 lg:col-span-2">
              <h3 className="font-bold mb-6 text-sm">Khám phá</h3>
              <ul className="space-y-4 text-sm text-white/70 font-light">
                <li><Link to="/products?createdAfter=lastmonth" className="hover:text-white transition-colors">Sản phẩm mới</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Yêu thích</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Về MIVA</Link></li>
              </ul>
            </div>
            
            <div className="md:col-span-4 lg:col-span-2">
              <h3 className="font-bold mb-6 text-sm">Hỗ trợ</h3>
              <ul className="space-y-4 text-sm text-white/70 font-light">
                <li><Link to="/contact" className="hover:text-white transition-colors">Liên hệ</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Giao hàng</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Đổi trả</Link></li>
              </ul>
            </div>
            
            <div className="md:col-span-12 lg:col-span-4">
              <h3 className="font-bold mb-6 text-sm">Ở lại cùng MIVA</h3>
              <p className="text-sm text-white/70 font-light mb-4">
                Nhận tin về sản phẩm mới và ưu đãi riêng.
              </p>
              <form className="relative border-b border-white/30 pb-2">
                <input 
                  type="email" 
                  placeholder="Email của bạn" 
                  className="w-full bg-transparent outline-none text-sm placeholder:text-white/40"
                />
                <button type="submit" className="absolute right-0 top-0 bottom-2 text-white hover:text-gray-300">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
            
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/50 font-light text-center md:text-left">
              © 2026 MIVA. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-white/50 font-light">
              <Link to="/" className="hover:text-white transition-colors">Điều khoản</Link>
              <span>·</span>
              <Link to="/" className="hover:text-white transition-colors">Quyền riêng tư</Link>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
