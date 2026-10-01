import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white/80 dark:bg-dark-card border-t border-light-border dark:border-dark-border mt-auto transition-colors duration-500">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="md:col-span-2 lg:col-span-1">
            <h2 className="text-3xl font-black text-primary mb-6 font-serif uppercase tracking-widest">Miva</h2>
            <p className="text-sm text-light-muted dark:text-dark-muted leading-loose font-light">
              Điểm đến mua sắm đồ xa xỉ của bạn. Trải nghiệm sự thanh lịch được tuyển chọn và dịch vụ đẳng cấp chưa từng có.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-light-text dark:text-dark-text mb-6 uppercase tracking-widest text-xs font-sans">Mua sắm</h3>
            <ul className="space-y-4 text-sm text-light-muted dark:text-dark-muted font-light">
              <li><Link to="/products" className="hover:text-primary transition-colors">Tất cả sản phẩm</Link></li>
              <li><Link to="/products?category=thoi-trang" className="hover:text-primary transition-colors">Thời trang</Link></li>
              <li><Link to="/products?category=lam-dep" className="hover:text-primary transition-colors">Làm đẹp</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-light-text dark:text-dark-text mb-6 uppercase tracking-widest text-xs font-sans">Dịch vụ</h3>
            <ul className="space-y-4 text-sm text-light-muted dark:text-dark-muted font-light">
              <li><Link to="/contact" className="hover:text-primary transition-colors">Chăm sóc khách hàng</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Giao hàng & Đổi trả</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-colors">Theo dõi đơn hàng</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-light-text dark:text-dark-text mb-6 uppercase tracking-widest text-xs font-sans">Miva Maison</h3>
            <ul className="space-y-4 text-sm text-light-muted dark:text-dark-muted font-light">
              <li><Link to="/about" className="hover:text-primary transition-colors">Về MIVA</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Điều khoản dịch vụ</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Chính sách bảo mật</Link></li>
            </ul>
          </div>
          
        </div>
        
        <div className="border-t border-light-border dark:border-dark-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-light-muted dark:text-dark-muted font-light tracking-widest uppercase text-center md:text-left">
            © {new Date().getFullYear()} Miva Maison. Bản quyền thuộc về Miva.
          </p>
        </div>
      </div>
    </footer>
  );
}
