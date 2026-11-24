import React, { useState, useEffect } from 'react';
import { 
  Mail, Phone, MapPin, CreditCard, Calendar, 
  ShieldCheck, Check, Loader2, Edit3, Save,
  Upload, Trash2
} from 'lucide-react';
import { profileApi } from '../../api/axiosClient';

export const MyProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchProfileAndData = async () => {
    try {
      setLoading(true);
      const res = await profileApi.getProfile();
      setProfile(res);
      setPhone(res.phone || '');
      setAddress(res.address || '');
      setAvatarUrl(res.avatarUrl || '');
    } catch (err) {
      console.error('Error fetching profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndData();
  }, []);

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
      alert('Không thể tải ảnh đại diện lên');
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
      setEditing(false);
      setTimeout(() => setMsg(''), 3000);
      fetchProfileAndData();
    } catch (err) {
      console.error(err);
      alert('Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        Không thể tải thông tin hồ sơ nhân viên.
      </div>
    );
  }

  const perms = profile.permissions || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          Hồ Sơ Nhân Sự
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Xem hồ sơ thông tin nhân sự và phạm vi phân quyền thao tác
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* PROFILE & CONTRACT */}
      <div className="space-y-6">
          {/* Main Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-indigo-100 overflow-hidden shrink-0">
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
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {profile.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-indigo-600 mt-0.5">
                    Mã NV: {profile.employeeCode}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {profile.position} • Phòng {profile.department}
                  </p>
                </div>
              </div>

              <div>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                    Cập nhật liên hệ
                  </button>
                ) : (
                  <button
                    onClick={() => setEditing(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-500"
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

                <div className="flex items-center gap-3 text-xs text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Email: <strong>{profile.email}</strong></span>
                </div>

                {editing ? (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Ảnh Đại Diện
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors">
                          {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" /> : <Upload className="w-3.5 h-3.5 text-indigo-600" />}
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
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Số Điện Thoại
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg px-3 py-1.5"
                        placeholder="0912345678"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Địa Chỉ
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg px-3 py-1.5"
                        placeholder="Địa chỉ cư trú"
                      />
                    </div>
                    <button
                      onClick={handleUpdate}
                      disabled={saving}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 text-xs text-slate-700">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>SĐT: <strong>{profile.phone || 'Chưa cập nhật'}</strong></span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-700">
                      <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>CCCD: <strong>{profile.citizenId || '---'}</strong></span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-700">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Địa chỉ: <strong>{profile.address || 'Chưa cập nhật'}</strong></span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Thông Tin Hợp Đồng
                </h4>

                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                  <span className="text-[11px] font-semibold text-indigo-700 block">
                    {profile.employmentType === 'part_time' ? 'Hợp đồng Bán thời gian (Part-time)' : 'Hợp đồng Toàn thời gian (Full-time)'}
                  </span>
                  <p className="text-xs text-indigo-950 font-medium">
                    Hình thức làm việc: {profile.employmentType === 'part_time' ? 'Làm việc theo ca phân công' : 'Nhân sự chính thức toàn thời gian'}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-700 pt-1">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Ngày bắt đầu làm việc: <strong>{profile.hireDate ? new Date(profile.hireDate).toLocaleDateString('vi-VN') : '---'}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Phạm Vi Phân Quyền Thao Tác (Permissions)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
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
                        ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                        : 'border-slate-100 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      hasPerm ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {hasPerm ? 'Được phép' : 'Không có quyền'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
  );
};
