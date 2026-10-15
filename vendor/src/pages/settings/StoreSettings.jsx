import { useState, useEffect } from 'react';
import {
  Store,
  Save,
  Loader2,
  Calendar,
  Clock,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Percent,
  Building2,
  Sparkles,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';

export default function StoreSettings() {
  const { user, checkAuth } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subLoading, setSubLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  const [form, setForm] = useState({
    storeName: '',
    fullName: '',
    phone: '',
    taxId: '',
    address: '',
  });

  // Renewal Modal State
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('1_year');
  const [isRenewing, setIsRenewing] = useState(false);

  const loadSubscription = async () => {
    try {
      setSubLoading(true);
      const data = await userService.getSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to load subscription info', error);
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setForm({
        storeName: user.storeName || '',
        fullName: user.fullName || '',
        phone: user.phone || '',
        taxId: user.taxId || '',
        address: user.address || '',
      });
    }
    loadSubscription();
  }, [user]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await userService.updateProfile({
        storeName: form.storeName || null,
        fullName: form.fullName,
        phone: form.phone || null,
        taxId: form.taxId || null,
        address: form.address || null,
      });
      await checkAuth();
      await loadSubscription();
      alert('Đã cập nhật thông tin cửa hàng thành công!');
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRenew = async () => {
    try {
      setIsRenewing(true);
      const updated = await userService.renewSubscription(selectedPlan);
      setSubscription(updated);
      setShowRenewModal(false);
      alert('Đã gửi yêu cầu gia hạn kinh doanh thành công! Ban quản trị sàn sẽ xem xét và phê duyệt.');
    } catch (error) {
      console.error('Failed to renew subscription', error);
      alert('Không thể gửi yêu cầu gia hạn: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsRenewing(false);
    }
  };

  const formatPrice = (val) => {
    if (!val && val !== 0) return '0 ₫';
    return Number(val).toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa cập nhật';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Cài đặt Cửa hàng & Tài khoản</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Quản lý thông tin pháp lý gian hàng, gói đăng ký kinh doanh và thời hạn hoạt động trên nền tảng MIVA
        </p>
      </div>

      {/* Subscription & Account Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                {subscription?.subscriptionPlan === '2_years' ? 'Gói Tiêu chuẩn 2 Năm' : 'Gói Tiêu chuẩn 1 Năm'}
              </span>

              {subscription?.isExpired ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  <AlertTriangle className="w-3.5 h-3.5" /> Đã hết hạn (Tạm khóa)
                </span>
              ) : subscription?.isExpiringSoon ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Clock className="w-3.5 h-3.5" /> Sắp hết hạn ({subscription.daysRemaining} ngày)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đang hoạt động
                </span>
              )}

              {subscription?.renewalRequested && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Đang chờ duyệt gia hạn ({subscription.renewalPlan === '2_years' ? '2 Năm' : '1 Năm'})
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              {form.storeName || user?.fullName || 'Gian hàng của bạn'}
            </h2>

            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Theo quy định nền tảng, đối tác đóng phí đăng ký theo gói thời hạn (1 năm / 2 năm). Sau khi đơn hàng giao thành công, sàn áp dụng mức chiết khấu cố định <strong>{subscription?.commissionRate || 5}%</strong> trên giá trị đơn.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <button
              onClick={() => setShowRenewModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Gia hạn gói kinh doanh
            </button>
            <span className="text-xs text-slate-400">
              Hạn hiện tại: <strong className="text-slate-200">{formatDate(subscription?.subscriptionExpiresAt)}</strong>
            </span>
          </div>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Ngày hết hạn
            </div>
            <div className="text-sm font-semibold text-white">
              {formatDate(subscription?.subscriptionExpiresAt)}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Thời gian còn lại
            </div>
            <div className="text-sm font-semibold text-white">
              {subscription?.subscriptionExpiresAt
                ? subscription.daysRemaining > 0
                  ? `${subscription.daysRemaining} ngày`
                  : 'Đã hết hạn'
                : 'Vô thời hạn'}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Percent className="w-3.5 h-3.5 text-indigo-400" /> Chiết khấu hoa hồng
            </div>
            <div className="text-sm font-semibold text-emerald-400">
              {subscription?.commissionRate ? `${subscription.commissionRate}%` : '5.00%'}
              <span className="text-[11px] text-slate-400 font-normal ml-1">/ đơn hoàn tất</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Phí gói duy trì
            </div>
            <div className="text-sm font-semibold text-white">
              {formatPrice(subscription?.subscriptionFee || (subscription?.subscriptionPlan === '2_years' ? 2000000 : 1200000))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Store Information & Subscription Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Profile */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 transition-colors rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shrink-0">
                <Store className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {form.storeName || user?.fullName || 'Thông tin gian hàng'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên cửa hàng (Store Name)
                </label>
                <input
                  type="text"
                  value={form.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  placeholder="Ví dụ: Cửa hàng Thời Trang MIVA"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Người đại diện pháp luật
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Số điện thoại liên hệ
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="09xx xxx xxx"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Mã số thuế (Tax ID)
                </label>
                <input
                  type="text"
                  value={form.taxId}
                  onChange={(e) => handleChange('taxId', e.target.value)}
                  placeholder="03xxxxxxxx"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Địa chỉ kinh doanh / kho lấy hàng
              </label>
              <textarea
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Lưu thông tin cửa hàng
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Policy & Renewal Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base">
              <Building2 className="w-5 h-5 text-indigo-500" />
              Chính sách kinh doanh & Gia hạn
            </h3>

            <div className="space-y-4 text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  1. Phí duy trì gói hàng năm
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Đối tác chọn gói 1 Năm (1.200.000 ₫) hoặc 2 Năm (2.000.000 ₫). Sau khi gửi yêu cầu, ban quản trị hoặc nhân viên được phân quyền sẽ xác nhận duyệt gia hạn.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  2. Khóa tạm thời khi hết hạn
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Khi gói kinh doanh quá hạn mà chưa được gia hạn, tài khoản sẽ chuyển sang trạng thái tạm khóa. Bạn chỉ cần bấm "Gia hạn gói kinh doanh" để tiếp tục hoạt động.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  3. Chiết khấu đơn hàng thành công
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Khi đơn hàng được giao thành công tới người mua, hệ thống sẽ tự động trích <strong>{subscription?.commissionRate || 5}%</strong> hoa hồng dịch vụ sàn MIVA.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRenewModal(true)}
              className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Chọn gói gia hạn ngay
            </button>
          </div>
        </div>
      </div>

      {/* Renewal Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Gia hạn gói kinh doanh</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Chọn thời hạn bạn muốn tiếp tục kinh doanh</p>
                </div>
              </div>
              <button
                onClick={() => setShowRenewModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            {/* Plan Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1 Year */}
              <div
                onClick={() => setSelectedPlan('1_year')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
                  selectedPlan === '1_year'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {selectedPlan === '1_year' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Gói Tiêu chuẩn</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">1 Năm</div>
                <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">1.200.000 ₫</div>
                <div className="text-xs text-slate-500 mt-2">Duy trì quyền kinh doanh thêm 12 tháng</div>
              </div>

              {/* 2 Years */}
              <div
                onClick={() => setSelectedPlan('2_years')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
                  selectedPlan === '2_years'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  Tiết kiệm 400k
                </span>
                {selectedPlan === '2_years' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Gói Ưu đãi</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">2 Năm</div>
                <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">2.000.000 ₫</div>
                <div className="text-xs text-slate-500 mt-2">Duy trì quyền kinh doanh thêm 24 tháng</div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span>Thời hạn hiện tại:</span>
                <strong className="text-slate-800 dark:text-slate-100">{formatDate(subscription?.subscriptionExpiresAt)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Thời hạn mới dự kiến:</span>
                <strong className="text-indigo-600 dark:text-indigo-400">
                  {formatDate(
                    new Date(
                      (subscription?.subscriptionExpiresAt && new Date(subscription.subscriptionExpiresAt) > new Date()
                        ? new Date(subscription.subscriptionExpiresAt).getTime()
                        : Date.now()) +
                        (selectedPlan === '2_years' ? 2 : 1) * 365 * 24 * 3600 * 1000
                    )
                  )}
                </strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-semibold text-sm">
                <span>Phí gia hạn cần thanh toán:</span>
                <span className="text-indigo-600 dark:text-indigo-400 text-base">
                  {selectedPlan === '2_years' ? '2.000.000 ₫' : '1.200.000 ₫'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRenewModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleRenew}
                disabled={isRenewing}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isRenewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Xác nhận gia hạn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
