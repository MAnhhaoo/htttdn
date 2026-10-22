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
  FileText,
  ShieldCheck,
  Check,
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors font-sans py-12">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 sm:p-10">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại Đăng nhập
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Đăng ký Mở Gian Hàng Đối Tác
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Trở thành đối tác kinh doanh chính thức trên nền tảng thương mại điện tử
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
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-emerald-500 text-white'
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
              className={`h-full bg-indigo-600 transition-all duration-300 ${
                step === 2 ? 'w-full' : 'w-0'
              }`}
            />
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                step === 2
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
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
            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-1">
                <User className="w-4 h-4" />
                <span>Thông tin cá nhân & Đăng nhập</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thông tin người chịu trách nhiệm pháp lý hoặc đại diện cửa hàng.
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
                className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2 font-medium shadow-md shadow-indigo-600/20"
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
            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 mb-2">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 text-sm font-semibold mb-1">
                <Building2 className="w-4 h-4" />
                <span>Bước 2: Hồ sơ Đăng ký kinh doanh & Doanh nghiệp</span>
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
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Gói 1 Năm</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Cơ bản
                    </span>
                  </div>
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">1.200.000 ₫</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Thời hạn: 12 tháng • Hoa hồng sàn: 8%
                  </div>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, subscriptionPlan: '2_years' })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                    formData.subscriptionPlan === '2_years'
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Gói 2 Năm</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      Tiết kiệm 400.000 ₫
                    </span>
                  </div>
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">2.000.000 ₫</div>
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
                  className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  required
                />
                <span className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                  Tôi cam kết các thông tin đăng ký kinh doanh và mã số thuế nêu trên là hoàn toàn chính xác và chịu trách nhiệm trước pháp luật. Tôi đồng ý với <a href="#" className="text-indigo-600 font-medium hover:underline">Điều khoản hợp tác</a> và <a href="#" className="text-indigo-600 font-medium hover:underline">Quy chế hoạt động sàn TMĐT</a>.
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
                className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-2 font-medium shadow-md shadow-indigo-600/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang gửi hồ sơ...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
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
