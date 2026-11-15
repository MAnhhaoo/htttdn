import { useState, useEffect, useCallback } from 'react';
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
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { formatPrice, formatDateOnly } from '../../utils/formatHelpers';
import { AvatarUploadField, Button, Modal, useToast } from '../../components/ui';

export default function StoreSettings() {
  const { user, checkAuth } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const [form, setForm] = useState({
    storeName: '',
    fullName: '',
    phone: '',
    taxId: '',
    address: '',
    avatarUrl: '',
  });

  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('1_year');
  const [isRenewing, setIsRenewing] = useState(false);

  const loadSubscription = useCallback(async () => {
    try {
      const data = await userService.getSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to load subscription info', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        storeName: user.storeName || '',
        fullName: user.fullName || '',
        phone: user.phone || '',
        taxId: user.taxId || '',
        address: user.address || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
    loadSubscription();
  }, [user, loadSubscription]);

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
        avatarUrl: form.avatarUrl?.trim() || null,
      });
      await checkAuth();
      await loadSubscription();
      toast.success('Đã cập nhật thông tin hồ sơ gian hàng thành công!');
    } catch (error) {
      console.error('Failed to update profile', error);
      toast.error('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
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
      toast.success(
        'Đã gửi yêu cầu gia hạn gói kinh doanh thành công! Ban Quản Trị sàn sẽ xem xét phê duyệt.',
      );
    } catch (error) {
      console.error('Failed to renew subscription', error);
      toast.error(
        'Không thể gửi yêu cầu gia hạn: ' + (error.response?.data?.message || error.message),
      );
    } finally {
      setIsRenewing(false);
    }
  };

  const formatExpireDate = (dateStr) =>
    dateStr ? formatDateOnly(dateStr) : 'Chưa cập nhật';

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Hồ sơ &amp; Gói Kinh doanh
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Quản lý thông tin pháp lý gian hàng, logo thương hiệu và thời hạn gói hợp tác trên nền tảng MIVA
        </p>
      </div>

      {/* Subscription Status Banner */}
      <div className="bg-gradient-to-r from-[#08130E] via-[#132A20] to-[#0E2219] border border-[#1A3327] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-[#C9A84C]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C9A84C]/15 text-[#DEC47E] border border-[#C9A84C]/35">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
                {subscription?.subscriptionPlan === '2_years'
                  ? 'Gói Ưu đãi 2 Năm'
                  : 'Gói Tiêu chuẩn 1 Năm'}
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
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#2A5C4A]/35 text-[#E2EFE8] border border-[#35755B]/50">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Đang chờ duyệt gia hạn (
                  {subscription.renewalPlan === '2_years' ? '2 Năm' : '1 Năm'})
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              {form.storeName || user?.fullName || 'Gian hàng của bạn'}
            </h2>

            <p className="text-[#C7D6CE] text-sm max-w-2xl leading-relaxed">
              Đối tác đăng ký gói duy trì theo kỳ hạn 1 năm (1.200.000 ₫) hoặc 2 năm (2.000.000 ₫). Mức chiết khấu dịch vụ sàn áp dụng cố định{' '}
              <strong className="text-[#DEC47E]">{subscription?.commissionRate || 8}%</strong> khi đơn hàng giao thành công.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setShowRenewModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#B08A2E] hover:from-[#D4B45A] hover:to-[#C9A84C] text-[#08130E] font-bold text-sm shadow-lg shadow-[#C9A84C]/25 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Gia hạn gói kinh doanh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#1A3327]">
          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Ngày hết hạn
            </div>
            <div className="text-sm font-semibold text-white">
              {formatExpireDate(subscription?.subscriptionExpiresAt)}
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
              {subscription?.commissionRate ? `${subscription.commissionRate}%` : '8%'}
              <span className="text-[11px] text-slate-400 font-normal ml-1">/ đơn hoàn tất</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Phí gói duy trì
            </div>
            <div className="text-sm font-semibold text-white">
              {formatPrice(
                subscription?.subscriptionFee ||
                  (subscription?.subscriptionPlan === '2_years' ? 2000000 : 1200000),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Store Information Form */}
      <div className="bg-white dark:bg-slate-900 transition-colors rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shrink-0 overflow-hidden">
            {form.avatarUrl?.trim() || user?.avatarUrl ? (
              <img
                src={form.avatarUrl?.trim() || user?.avatarUrl}
                alt={form.storeName || user?.fullName || 'Gian hàng'}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {form.storeName || user?.fullName || 'Thông tin pháp lý gian hàng'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Tên gian hàng hiển thị
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
              Mã số thuế / Số ĐKKD
            </label>
            <input
              type="text"
              value={form.taxId}
              onChange={(e) => handleChange('taxId', e.target.value)}
              placeholder="03xxxxxxxx"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="sm:col-span-2">
            <AvatarUploadField
              label="Ảnh đại diện / Logo gian hàng"
              avatarUrl={form.avatarUrl}
              altName={form.storeName || user?.fullName || 'Gian hàng'}
              uploadFn={userService.uploadAvatar}
              onChange={(url) => handleChange('avatarUrl', url)}
              onError={(msg) => toast.error(msg)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Địa chỉ kinh doanh / Kho lấy hàng
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
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Lưu thông tin cửa hàng
          </Button>
        </div>
      </div>

      {/* Renewal Modal using Shared Modal */}
      <Modal
        isOpen={showRenewModal}
        onClose={() => !isRenewing && setShowRenewModal(false)}
        title="Gia hạn gói kinh doanh"
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setShowRenewModal(false)}
              disabled={isRenewing}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleRenew}
              disabled={isRenewing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            >
              {isRenewing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              Xác nhận gia hạn
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chọn kỳ hạn duy trì hoạt động gian hàng trên sàn thương mại điện tử MIVA:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Gói Tiêu chuẩn
              </div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100">1 Năm</div>
              <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
                1.200.000 ₫
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Duy trì quyền kinh doanh thêm 12 tháng
              </div>
            </div>

            <div
              onClick={() => setSelectedPlan('2_years')}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
                selectedPlan === '2_years'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                Tiết kiệm 400.000 ₫
              </span>
              {selectedPlan === '2_years' && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Gói Ưu đãi
              </div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100">2 Năm</div>
              <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
                2.000.000 ₫
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Duy trì quyền kinh doanh thêm 24 tháng
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span>Thời hạn hiện tại:</span>
              <strong className="text-slate-800 dark:text-slate-100">
                {formatExpireDate(subscription?.subscriptionExpiresAt)}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Thời hạn mới dự kiến:</span>
              <strong className="text-indigo-600 dark:text-indigo-400">
                {formatExpireDate(
                  new Date(
                    (subscription?.subscriptionExpiresAt &&
                    new Date(subscription.subscriptionExpiresAt) > new Date()
                      ? new Date(subscription.subscriptionExpiresAt).getTime()
                      : Date.now()) +
                      (selectedPlan === '2_years' ? 2 : 1) * 365 * 24 * 3600 * 1000,
                  ),
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
        </div>
      </Modal>
    </div>
  );
}
