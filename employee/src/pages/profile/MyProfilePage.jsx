import { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Clock,
  TrendingUp,
  ShieldCheck,
  Check,
  AlertCircle,
  Loader2,
  Edit3,
  Save,
  DollarSign,
  CheckCircle2,
  Calculator,
  Upload,
  Trash2,
} from 'lucide-react';
import { useToast } from '@shared/components/ui';
import { formatVND } from '@shared/utils/formatHelpers';
import { profileApi, payrollApi } from '../../api/axiosClient';
import { AttendanceCheckInModal } from '../../components/attendance/AttendanceCheckInModal';

const PAYROLL_STATUS_CONFIG = {
  draft: {
    label: 'Bản nháp (Đang duyệt)',
    color:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  },
  approved: {
    label: 'Đã phê duyệt',
    color:
      'bg-[#EEF5F1] text-[#1A3A2C] border-[#B9D6C6] dark:bg-[#1A3A2C]/50 dark:text-[#8BBAA1] dark:border-[#2A5C4A]',
  },
  paid: {
    label: 'Đã chi trả',
    color:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  },
};

export const MyProfilePage = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'payslips' | 'attendance'
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchProfileAndData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await profileApi.getProfile();
      setProfile(res);
      setPhone(res.phone || '');
      setAddress(res.address || '');
      setAvatarUrl(res.avatarUrl || '');

      if (res.id) {
        const [histRes, payRes, attRes] = await Promise.allSettled([
          profileApi.getSalaryHistory(res.id),
          payrollApi.getMyPayslips(),
          payrollApi.getAttendance(),
        ]);

        if (histRes.status === 'fulfilled') setHistory(histRes.value || []);
        if (payRes.status === 'fulfilled') setPayslips(payRes.value || []);
        if (attRes.status === 'fulfilled') setAttendances(attRes.value || []);
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileAndData();
  }, [fetchProfileAndData]);

  useEffect(() => {
    window.addEventListener('miva:attendance', fetchProfileAndData);
    return () => window.removeEventListener('miva:attendance', fetchProfileAndData);
  }, [fetchProfileAndData]);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const uploadedUrl = await profileApi.uploadAvatar(file);
      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải ảnh đại diện lên');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await profileApi.updateProfile({
        phone,
        address,
        avatarUrl: avatarUrl.trim() || null,
      });
      setMsg('Cập nhật thông tin liên hệ thành công!');
      toast.success('Cập nhật thông tin liên hệ thành công!');
      setEditing(false);
      setTimeout(() => setMsg(''), 3000);
      fetchProfileAndData();
    } catch (err) {
      console.error(err);
      toast.error('Không thể cập nhật thông tin hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A3A2C] dark:text-[#DEC47E]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
        Không thể tải thông tin hồ sơ nhân viên.
      </div>
    );
  }

  const perms = profile.permissions || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Hồ Sơ Nhân Sự &amp; Hợp Đồng Lương
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Xem hồ sơ, đãi ngộ hợp đồng, lịch sử phiếu lương hàng tháng và bảng chấm công
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-[#1A3A2C] text-[#1A3A2C] dark:text-[#DEC47E] shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hồ Sơ &amp; Hợp Đồng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payslips')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'payslips'
                ? 'bg-white dark:bg-[#1A3A2C] text-[#1A3A2C] dark:text-[#DEC47E] shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Phiếu Lương ({payslips.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-white dark:bg-[#1A3A2C] text-[#1A3A2C] dark:text-[#DEC47E] shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Chấm Công ({attendances.length})
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/35 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* TAB 1: PROFILE & CONTRACT */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Main Profile Card */}
          <div className="bg-white dark:bg-[#131B17] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1A3A2C] to-[#2A5C4A] text-[#DEC47E] border border-[#C9A84C]/35 font-extrabold text-2xl flex items-center justify-center shadow-md overflow-hidden shrink-0">
                  {(editing ? avatarUrl.trim() : profile.avatarUrl) ? (
                    <img
                      src={editing ? avatarUrl.trim() : profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    profile.fullName?.[0]?.toUpperCase() || 'E'
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {profile.fullName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/35">
                      {profile.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-[#1A3A2C] dark:text-[#DEC47E] mt-0.5">
                    Mã NV: {profile.employeeCode}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {profile.position} • Phòng {profile.department}
                  </p>
                </div>
              </div>

              <div>
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#2A5C4A] dark:text-[#DEC47E]" />
                    Cập nhật liên hệ
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Thông Tin Liên Hệ &amp; Định Danh
                </h4>

                <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Email: <strong className="text-slate-900 dark:text-white">{profile.email}</strong>
                  </span>
                </div>

                {editing ? (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Ảnh Đại Diện
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors">
                          {uploadingAvatar ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2A5C4A] dark:text-[#DEC47E]" />
                          ) : (
                            <Upload className="w-3.5 h-3.5 text-[#2A5C4A] dark:text-[#DEC47E]" />
                          )}
                          {uploadingAvatar ? 'Đang tải...' : 'Chọn ảnh'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFileChange}
                            disabled={uploadingAvatar}
                            className="hidden"
                          />
                        </label>
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl('')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Số Điện Thoại
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 outline-none focus:border-[#2A5C4A] dark:focus:border-[#C9A84C]"
                        placeholder="0912345678"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Địa Chỉ
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 outline-none focus:border-[#2A5C4A] dark:focus:border-[#C9A84C]"
                        placeholder="Địa chỉ cư trú"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleUpdate}
                      disabled={saving}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#2A5C4A] dark:hover:bg-[#35755B] text-white text-xs font-semibold cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        SĐT:{' '}
                        <strong className="text-slate-900 dark:text-white">
                          {profile.phone || 'Chưa cập nhật'}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                      <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        CCCD:{' '}
                        <strong className="text-slate-900 dark:text-white">
                          {profile.citizenId || '---'}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        Địa chỉ:{' '}
                        <strong className="text-slate-900 dark:text-white">
                          {profile.address || 'Chưa cập nhật'}
                        </strong>
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Hợp Đồng &amp; Đãi Ngộ
                </h4>

                <div className="p-4 rounded-xl bg-[#FBF7EC] dark:bg-[#C9A84C]/10 border border-[#E6D39A] dark:border-[#C9A84C]/30">
                  <span className="text-[11px] font-semibold text-[#8C6B1F] dark:text-[#DEC47E] block">
                    {profile.employmentType === 'part_time'
                      ? 'Hợp đồng Bán thời gian (Part-time)'
                      : 'Hợp đồng Toàn thời gian (Full-time)'}
                  </span>
                  <h3 className="text-xl font-extrabold text-[#1A3A2C] dark:text-white mt-1">
                    {profile.employmentType === 'part_time'
                      ? `${formatVND(profile.hourlyRate)} / giờ`
                      : `${formatVND(profile.salary)} / tháng`}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                    {profile.employmentType === 'part_time'
                      ? 'Lương được tổng kết và thanh toán theo số giờ làm việc thực tế ghi nhận trên bảng chấm công'
                      : 'Lương cơ bản hàng tháng (chưa bao gồm phụ cấp & thưởng hiệu suất)'}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 pt-1">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Ngày bắt đầu làm việc:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {profile.hireDate
                        ? new Date(profile.hireDate).toLocaleDateString('vi-VN')
                        : '---'}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="bg-white dark:bg-[#131B17] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#2A5C4A] dark:text-[#DEC47E]" />
              Phạm Vi Phân Quyền Thao Tác (Permissions)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Các chức năng bạn được phép truy cập và thực hiện trong hệ thống:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'orders_read', label: 'Xem danh sách & chi tiết đơn hàng' },
                { key: 'orders_confirm', label: 'Xác nhận đơn hàng' },
                { key: 'orders_dispatch', label: 'Chuyển đơn cho Vendor' },
                { key: 'orders_reject', label: 'Từ chối đơn chưa xác nhận' },
                { key: 'orders_issue_handle', label: 'Xử lý sự cố / Khiếu nại' },
                { key: 'shipping_manage', label: 'Điều phối vận chuyển nội bộ' },
              ].map((item) => {
                const hasPerm = Boolean(perms[item.key]);
                return (
                  <div
                    key={item.key}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                      hasPerm
                        ? 'border-[#B9D6C6] dark:border-[#2A5C4A] bg-[#EEF5F1]/70 dark:bg-[#1A3A2C]/35 text-[#1A3A2C] dark:text-[#B9D6C6]'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        hasPerm
                          ? 'bg-[#1A3A2C] text-[#DEC47E]'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {hasPerm ? 'Được phép' : 'Không có quyền'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Salary History Timeline */}
          <div className="bg-white dark:bg-[#131B17] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#2A5C4A] dark:text-[#DEC47E]" />
              Lịch Sử Điều Chỉnh Lương &amp; Hợp Đồng
            </h3>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Chưa có ghi nhận điều chỉnh lương nào.
              </p>
            ) : (
              <div className="space-y-4">
                {history.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">
                          Mức lương mới:{' '}
                          {item.employmentType === 'part_time'
                            ? `${formatVND(item.newHourlyRate)} / giờ`
                            : `${formatVND(item.newSalary)} / tháng`}
                        </span>
                        {item.oldSalary !== null && (
                          <span className="text-[11px] text-slate-400">
                            (Mức cũ: {formatVND(item.oldSalary)})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Lý do: {item.reason || 'Điều chỉnh định kỳ'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Ngày hiệu lực</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {new Date(item.effectiveDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY PAYSLIPS */}
      {activeTab === 'payslips' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#131B17] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Danh Sách Phiếu Lương Hàng Tháng
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Các kỳ lương đã được tính toán, phê duyệt và thanh toán bởi Ban Giám Đốc MIVA
              </p>
            </div>
            <div className="p-3 bg-[#FBF7EC] dark:bg-[#C9A84C]/15 text-[#8C6B1F] dark:text-[#DEC47E] rounded-xl border border-[#E6D39A]/60 dark:border-[#C9A84C]/30">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {payslips.length === 0 ? (
            <div className="bg-white dark:bg-[#131B17] p-12 text-center text-slate-400 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Calculator className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              Chưa có phiếu lương nào được tạo cho tài khoản của bạn.
            </div>
          ) : (
            <div className="space-y-4">
              {payslips.map((p) => {
                const conf = PAYROLL_STATUS_CONFIG[p.status] || {
                  label: p.status,
                  color:
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                };
                const isPartTime = p.employmentType === 'part_time';

                return (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-[#131B17] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-[#2A5C4A] dark:text-[#DEC47E] uppercase tracking-wider">
                          Kỳ Lương Tháng {p.month}/{p.year}
                        </span>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                          {isPartTime
                            ? 'Hợp đồng Bán thời gian (Part-time)'
                            : 'Hợp đồng Toàn thời gian (Full-time)'}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${conf.color}`}
                        >
                          {conf.label}
                        </span>
                        {p.paidAt && (
                          <span className="text-[11px] text-slate-400">
                            Thanh toán: {new Date(p.paidAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-slate-400 font-semibold">Lương cơ bản / Đơn giá</p>
                        <p className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">
                          {isPartTime ? `${formatVND(p.hourlyRate)} / h` : formatVND(p.baseSalary)}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400 font-semibold">Thời gian làm việc</p>
                        <p className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">
                          {isPartTime
                            ? `${Number(p.totalHours || 0).toFixed(1)} giờ`
                            : 'Tiêu chuẩn tháng'}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400 font-semibold">Phụ cấp &amp; Thưởng</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                          +{formatVND(Number(p.allowances) + Number(p.bonus))}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400 font-semibold">Khấu trừ</p>
                        <p className="font-bold text-rose-500 dark:text-rose-400 text-sm mt-0.5">
                          -{formatVND(p.deductions)}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-[#EEF5F1] dark:bg-emerald-500/10 rounded-xl flex items-center justify-between border border-[#B9D6C6] dark:border-emerald-500/30">
                      <span className="text-xs font-bold text-[#1A3A2C] dark:text-emerald-200">
                        Lương Thực Lĩnh (Net Income):
                      </span>
                      <span className="text-xl font-extrabold text-[#1A3A2C] dark:text-[#DEC47E]">
                        {formatVND(p.netSalary)}
                      </span>
                    </div>

                    {p.notes && (
                      <p className="text-[11px] text-slate-400 italic">
                        Ghi chú từ kế toán: {p.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Shift Schedule Info Card */}
          {(() => {
            const sch = profile?.permissions?.schedule || {};
            const sName = sch.shiftName || 'Ca hành chính tiêu chuẩn';
            const sStart = sch.shiftStart || '08:30';
            const sEnd = sch.shiftEnd || '16:30';
            const sHours = Number(sch.shiftHours || 8);

            return (
              <div className="bg-gradient-to-r from-[#EEF5F1] via-[#FBF7EC]/75 to-[#EEF5F1] dark:from-[#13251C] dark:via-[#182B21] dark:to-[#13251C] border border-[#B9D6C6] dark:border-[#2A5C4A]/70 rounded-2xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1A3A2C] text-[#DEC47E] shadow-xs">
                        Lịch Phân Công Hiện Tại
                      </span>
                      <span className="font-bold text-[#1A3A2C] dark:text-white text-sm">
                        {sName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Ca trực từ{' '}
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {sStart}
                      </span>{' '}
                      đến{' '}
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {sEnd}
                      </span>{' '}
                      ({sHours} tiếng/ngày).
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 italic">
                      Lưu ý: Nếu chấm công sau {sStart}, hệ thống yêu cầu nhập lý do đi trễ và tiền
                      lương sẽ được tính theo số giờ làm thực tế.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCheckInModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#C9A84C] dark:hover:bg-[#DFC06B] text-white dark:text-[#08130E] rounded-xl text-xs font-bold shadow-md transition shrink-0 cursor-pointer"
                  >
                    <Clock className="w-4 h-4" />
                    Chấm Công Vào Ca
                  </button>
                </div>
              </div>
            );
          })()}

          {attendances.length === 0 ? (
            <div className="bg-white dark:bg-[#131B17] p-12 text-center text-slate-400 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              Chưa có dữ liệu chấm công. Bấm nút &ldquo;Chấm Công Vào Ca&rdquo; để bắt đầu ghi nhận.
            </div>
          ) : (
            <div className="bg-white dark:bg-[#131B17] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3">Ngày</th>
                      <th className="px-5 py-3">Giờ vào</th>
                      <th className="px-5 py-3">Trạng thái</th>
                      <th className="px-5 py-3 text-center">Số giờ thực tế</th>
                      <th className="px-5 py-3">Ghi chú &amp; Lý do trễ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {attendances.map((att) => {
                      const isLateAtt = att.status === 'late';
                      return (
                        <tr
                          key={att.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-white">
                            {new Date(att.date).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                            {att.checkIn
                              ? new Date(att.checkIn).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '---'}
                          </td>
                          <td className="px-5 py-3.5">
                            {isLateAtt ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/35 inline-flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />{' '}
                                Đi trễ
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/35 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />{' '}
                                Đúng giờ
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-center font-mono font-bold text-[#1A3A2C] dark:text-[#DEC47E]">
                            {Number(att.hoursWorked || 0).toFixed(1)} giờ
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                            {att.note || '---'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attendance Check In Modal */}
      <AttendanceCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        profile={profile}
        onSuccess={fetchProfileAndData}
      />
    </div>
  );
};
