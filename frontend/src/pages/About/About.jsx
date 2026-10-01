import { Link } from 'react-router-dom';
import { Sparkles, Target, ShoppingBag, Layers, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="pb-16 bg-light-bg dark:bg-dark-bg transition-colors duration-500">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-16 md:pt-24 pb-20 md:pb-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent dark:from-primary/10 dark:via-dark-bg dark:to-dark-bg" />
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs sm:text-sm font-semibold tracking-widest uppercase mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Về chúng tôi
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-light-text dark:text-dark-text leading-tight mb-6">
            Về <span className="text-primary italic">MIVA</span>
          </h1>
          <p className="text-base sm:text-lg text-light-muted dark:text-dark-muted max-w-2xl mx-auto leading-relaxed font-light">
            Nền tảng thương mại điện tử đa nhà bán hàng — nơi kết nối người mua
            với những sản phẩm chất lượng từ nhiều nhà bán hàng uy tín.
          </p>
        </div>
      </section>

      {/* ── Intro Card ── */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 -mt-10 mb-16">
        <div className="card-surface rounded-3xl p-8 md:p-12 shadow-xl">
          <p className="text-center text-light-muted dark:text-dark-muted leading-loose text-base md:text-lg font-light max-w-3xl mx-auto">
            MIVA là một dự án nền tảng thương mại điện tử được xây dựng
            với mô hình đa nhà bán hàng (multi-vendor marketplace). Tại đây, nhiều nhà bán hàng
            có thể đăng bán sản phẩm của mình, trong khi người mua có thể khám phá,
            so sánh và mua sắm trên một nền tảng duy nhất — tiện lợi, nhanh chóng và đáng tin cậy.
          </p>
        </div>
      </section>

      {/* ── Feature Sections ── */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <FeatureCard
            icon={Sparkles}
            title="Câu chuyện MIVA"
            description="MIVA được phát triển với mục tiêu tạo ra một trải nghiệm mua sắm trực tuyến tiện lợi, đáng tin cậy và hiện đại. Chúng tôi tin rằng mọi người xứng đáng được tiếp cận những sản phẩm chất lượng với dịch vụ tốt nhất."
          />
          <FeatureCard
            icon={Target}
            title="Mục tiêu của nền tảng"
            description="Xây dựng một sàn thương mại điện tử minh bạch, công bằng cho cả người mua và nhà bán hàng. Mỗi giao dịch đều được hỗ trợ bởi hệ thống quản lý chất lượng, đảm bảo quyền lợi cho tất cả các bên."
          />
          <FeatureCard
            icon={ShoppingBag}
            title="Trải nghiệm mua sắm"
            description="Giao diện thân thiện và dễ sử dụng. Tìm kiếm và lọc sản phẩm thông minh. Quy trình đặt hàng đơn giản, nhanh chóng. Theo dõi đơn hàng và quản lý tài khoản tiện lợi."
          />
          <FeatureCard
            icon={Layers}
            title="Đa dạng sản phẩm"
            description="MIVA quy tụ nhiều danh mục sản phẩm phong phú từ nhiều nhà bán hàng khác nhau. Từ thời trang, làm đẹp đến đồ gia dụng và chăm sóc sức khỏe — tất cả đều có trên một nền tảng."
          />
          <FeatureCard
            icon={Users}
            title="Kết nối người mua và nhà bán hàng"
            description="MIVA tạo cầu nối giữa người tiêu dùng và các nhà bán hàng. Người bán có thể dễ dàng quản lý cửa hàng, sản phẩm và đơn hàng thông qua giao diện quản lý chuyên biệt."
          />

          {/* CTA card */}
          <div className="card-surface rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-3">
              Bắt đầu mua sắm
            </h3>
            <p className="text-sm text-light-muted dark:text-dark-muted mb-5">
              Khám phá hàng ngàn sản phẩm chất lượng ngay hôm nay.
            </p>
            <Link
              to="/products"
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/30 text-sm"
            >
              Khám phá ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="card-surface rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-3">
        {title}
      </h3>
      <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed">
        {description}
      </p>
    </div>
  );
}
