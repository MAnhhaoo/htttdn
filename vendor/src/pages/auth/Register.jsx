import { useState } from 'react';
import {
  Store,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Building2,
  User,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { Button, Input, Select } from '../../components/ui';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function VendorRegister() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Bước 1: Tài khoản người đại diện
    fullName: '',
    phone: '',
    email: '',
    password: '',

    // Bước 2: Đăng ký kinh doanh
    storeName: '',
    taxId: '',
    businessType: 'household',
    address: '',
    subscriptionPlan: '1_year',
    agreedToTerms: false,
  });

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setError('Họ và tên người đại diện phải có ít nhất 2 ký tự');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Email không hợp lệ');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (!formData.phone || formData.phone.trim().length < 9) {
      setError('Số điện thoại liên hệ phải có ít nhất 9 số');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.storeName.trim()) {
      setError('Vui lòng nhập tên gian hàng / doanh nghiệp');
      return;
    }
    if (!formData.taxId.trim()) {
      setError('Vui lòng nhập Mã số thuế hoặc Số đăng ký kinh doanh');
      return;
    }
    if (!formData.address.trim()) {
      setError('Vui lòng nhập địa chỉ kinh doanh / kho lấy hàng');
      return;
    }
    if (!formData.agreedToTerms) {
      setError('Bạn cần đồng ý với Điều khoản dịch vụ và Quy chế hoạt động sàn');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        fullName: formData.fullName.trim(),
        storeName: formData.storeName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        taxId: formData.taxId.trim(),
        address: formData.address.trim(),
        subscriptionPlan: formData.subscriptionPlan,
        businessType: formData.businessType,
      });

      navigate('/login', {
        replace: true,
        state: { registered: true, email: formData.email.trim().toLowerCase() },
      });
    } catch (err) {
      console.error('Đăng ký thất bại:', err);
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#07120D] flex items-center justify-center p-4 transition-colors font-sans py-12">
      {/* MIVA Deep Forest & Champagne Gold Aurora Mesh Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-36 -left-36 w-[560px] h-[560px] rounded-full bg-[#1A3A2C]/65 blur-[140px]" />
        <div className="absolute top-1/4 -right-36 w-[540px] h-[540px] rounded-full bg-[#C9A84C]/20 blur-[145px]" />
        <div className="absolute -bottom-40 left-1/3 w-[540px] h-[540px] rounded-full bg-[#2A5C4A]/40 blur-[150px]" />
        <div className="absolute top-20 right-1/3 w-[320px] h-[320px] rounded-full bg-[#B08A2E]/15 blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #C9A84C 1px, transparent 1px), linear-gradient(to bottom, #C9A84C 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="hidden lg:flex items-center gap-2.5 fixed top-8 left-8 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-xl border border-[#C9A84C]/25 text-xs text-[#E8F0EC] shadow-lg z-10">
        <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
        <span className="font-semibold text-white">MIVA Kênh Người Bán</span>
        <span className="text-[#C9A84C]/70">•</span>
        <span className="text-[#DEC47E]">Đăng ký Đối tác Bán hàng MIVA</span>
      </div>

      <div className="max-w-2xl w-full bg-white/95 dark:bg-[#131B17]/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_70px_-15px_rgba(7,18,13,0.75)] border border-white/30 dark:border-[#223029] ring-1 ring-[#C9A84C]/25 p-8 sm:p-10 relative z-10 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#1A3A2C] via-[#C9A84C] to-[#2A5C4A]" />

        <Link
          to="/login"
          className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-[#1A3A2C] dark:hover:text-[#DEC47E] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại Đăng nhập
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#9E7B23] text-[#08130E] flex items-center justify-center shadow-lg shadow-[#C9A84C]/25 shrink-0">
              <Store className="w-6 h-6 stroke-[2.1]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Đăng ký Đối tác Bán hàng MIVA
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Trở thành đối tác kinh doanh chính thức trên nền tảng thương mại điện tử MIVA
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                step === 1
                  ? 'bg-[#1A3A2C] text-[#DEC47E] border border-[#C9A84C]/40 shadow-md shadow-[#1A3A2C]/25'
                  : 'bg-[#2A5C4A] text-white'
              }`}
            >
              {step > 1 ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">Bước 1</div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Tài khoản người đại diện
              </div>
            </div>
          </div>

          <div className="h-0.5 flex-1 mx-4 bg-slate-200 dark:bg-slate-700 hidden sm:block">
            <div
              className={`h-full bg-gradient-to-r from-[#1A3A2C] to-[#C9A84C] transition-all duration-300 ${
                step === 2 ? 'w-full' : 'w-0'
              }`}
            />
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                step === 2
                  ? 'bg-[#1A3A2C] text-[#DEC47E] border border-[#C9A84C]/40 shadow-md shadow-[#1A3A2C]/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              2
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">Bước 2</div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Đăng ký kinh doanh
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-sm rounded-xl border border-rose-100 dark:border-rose-900/50 flex items-center gap-2">
            <span className="font-semibold">Lỗi:</span> {error}
          </div>
        )}

        {/* STEP 1: Personal & Account Information */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-5">
            <div className="bg-[#EEF5F1]/70 dark:bg-[#1A3A2C]/25 p-4 rounded-2xl border border-[#2A5C4A]/15 dark:border-[#2A5C4A]/40 mb-2">
              <div className="flex items-center gap-2 text-[#1A3A2C] dark:text-[#DEC47E] text-sm font-semibold mb-1">
                <User className="w-4 h-4" />
                <span>Thông tin cá nhân &amp; Đăng nhập</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Thông tin người chịu trách nhiệm pháp lý hoặc đại diện cửa hàng trên MIVA.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Họ và tên người đại diện *"
                placeholder="Ví dụ: Nguyễn Văn An"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <Input
                label="Số điện thoại liên hệ *"
                type="tel"
                placeholder="Ví dụ: 0912345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <Input
              label="Email đăng nhập *"
              type="email"
              placeholder="vendor@store.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <div className="relative">
              <Input
                label="Mật khẩu tài khoản *"
                type={showPassword ? 'text' : 'password'}
                placeholder="Tối thiểu 6 ký tự"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-[32px] p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                className="h-11 px-6 bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#2A5C4A] dark:hover:bg-[#35755B] text-white rounded-xl flex items-center gap-2 font-medium shadow-md shadow-[#1A3A2C]/25"
              >
                <span>Tiếp tục: Đăng ký kinh doanh</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Business Registration Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-[#EEF5F1]/80 dark:bg-[#1A3A2C]/30 p-4 rounded-2xl border border-[#2A5C4A]/20 dark:border-[#2A5C4A]/45 mb-2">
              <div className="flex items-center gap-2 text-[#1A3A2C] dark:text-[#DEC47E] text-sm font-semibold mb-1">
                <Building2 className="w-4 h-4" />
                <span>Bước 2: Hồ sơ Đăng ký kinh doanh &amp; Doanh nghiệp</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Khai báo thông tin giấy phép kinh doanh để được duyệt và cấp gian hàng chính thức.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tên gian hàng / Doanh nghiệp *"
                placeholder="Ví dụ: Cửa Hàng Thời Trang An Phát"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                required
              />

              <Input
                label="Mã số thuế / Số giấy phép ĐKKD *"
                placeholder="Ví dụ: 0101234567 hoặc 0312345678"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Loại hình kinh doanh *"
                options={[
                  { value: 'household', label: 'Hộ kinh doanh cá thể' },
                  { value: 'company', label: 'Doanh nghiệp / Công ty (TNHH, CP)' },
                  { value: 'individual', label: 'Cá nhân kinh doanh' },
                ]}
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                required
              />

              <Input
                label="Địa chỉ kinh doanh / Kho lấy hàng *"
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            {/* Subscription Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Chọn Gói Hợp Tác Gian Hàng Trên Sàn *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setFormData({ ...formData, subscriptionPlan: '1_year' })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.subscriptionPlan === '1_year'
                      ? 'border-[#C9A84C] bg-[#FBF7EC]/80 dark:bg-[#C9A84C]/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-[#2A5C4A]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      Gói 1 Năm
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Cơ bản
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#1A3A2C] dark:text-[#DEC47E]">
                    1.200.000 ₫
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Thời hạn: 12 tháng • Hoa hồng sàn: 8%
                  </div>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, subscriptionPlan: '2_years' })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                    formData.subscriptionPlan === '2_years'
                      ? 'border-[#C9A84C] bg-[#FBF7EC]/80 dark:bg-[#C9A84C]/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-[#2A5C4A]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      Gói 2 Năm
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#C9A84C]/20 text-[#9E7B23] dark:text-[#DEC47E]">
                      Tiết kiệm 400.000 ₫
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#1A3A2C] dark:text-[#DEC47E]">
                    2.000.000 ₫
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Thời hạn: 24 tháng • Hoa hồng sàn: 8%
                  </div>
                </div>
              </div>
            </div>

            {/* Terms agreement */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-1 rounded border-slate-300 text-[#1A3A2C] focus:ring-[#1A3A2C]"
                  required
                />
                <span className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                  Tôi cam kết các thông tin đăng ký kinh doanh và mã số thuế nêu trên là hoàn toàn chính xác và chịu trách nhiệm trước pháp luật. Tôi đồng ý với{' '}
                  <a
                    href="#"
                    className="text-[#1A3A2C] dark:text-[#DEC47E] font-semibold hover:underline"
                  >
                    Điều khoản hợp tác
                  </a>{' '}
                  và{' '}
                  <a
                    href="#"
                    className="text-[#1A3A2C] dark:text-[#DEC47E] font-semibold hover:underline"
                  >
                    Quy chế hoạt động sàn TMĐT MIVA
                  </a>
                  .
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="h-11 px-5 rounded-xl text-slate-600 dark:text-slate-300"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại Bước 1
              </Button>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 px-6 bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#2A5C4A] dark:hover:bg-[#35755B] text-white rounded-xl flex items-center justify-center gap-2 font-medium shadow-md shadow-[#1A3A2C]/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang gửi hồ sơ...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-[#DEC47E]" />
                    <span>Hoàn tất Đăng ký kinh doanh</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
