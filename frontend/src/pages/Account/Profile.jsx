import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { addressService } from '../../services/addressService';
import { useToast } from '../../components/common/Toast/Toast';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { User, Mail, MapPin, Phone, Calendar, Users, Pencil, X, Check } from 'lucide-react';

const GENDER_OPTIONS = [
  { value: '', label: 'Chưa chọn' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
  { value: 'prefer_not_to_say', label: 'Không muốn tiết lộ' },
];

const PHONE_REGEX = /^(0|\+84)\d{9,10}$/;

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');
const genderLabel = (value) => GENDER_OPTIONS.find((g) => g.value === (value || ''))?.label || 'Chưa chọn';
const formatDate = (value) => {
  const iso = toDateInput(value);
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};
const getErrorMessage = (error, fallback) =>
  error?.response?.data?.errors?.[0]?.message || error?.response?.data?.message || fallback;

const joinAddress = (a) =>
  a ? [a.addressLine, a.ward, a.district, a.province].map((p) => (p || '').trim()).filter(Boolean).join(', ') : '';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-light-muted dark:text-dark-muted">{label}</p>
        <p className="font-semibold text-light-text dark:text-dark-text break-words">{value || 'Chưa cập nhật'}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, logout, isLoggingOut, updateProfile, isUpdatingProfile, refreshProfile } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: addressRes } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService.getAddresses(),
    enabled: !!user,
  });
  const addresses = useMemo(
    () => (Array.isArray(addressRes) ? addressRes : addressRes?.data || []),
    [addressRes],
  );
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;

  const [isEditing, setIsEditing] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', gender: '', dateOfBirth: '' });
  const [addressText, setAddressText] = useState('');
  const [errors, setErrors] = useState({});

  const resetForms = () => {
    setForm({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      dateOfBirth: toDateInput(user?.dateOfBirth),
    });
    setAddressText(joinAddress(defaultAddress) || user?.address || '');
    setErrors({});
  };

  // Keep the form in sync when entering edit mode.
  useEffect(() => {
    if (isEditing) resetForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  if (!user) return null;

  const addressValue = addressText.trim();
  const addressChanged = addressValue !== joinAddress(defaultAddress) && (addressValue !== '' || !!defaultAddress);
  // Receiver name/phone are no longer edited here: reuse the existing address values, fall back to profile info.
  const receiverName = (defaultAddress?.receiverName || form.fullName).trim();
  const receiverPhone = (defaultAddress?.phone || form.phone).trim();

  const validate = () => {
    const next = {};
    const fullName = form.fullName.trim();
    if (fullName.length < 2) next.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    if (fullName.length > 255) next.fullName = 'Họ tên tối đa 255 ký tự';
    if (form.phone.trim() && !PHONE_REGEX.test(form.phone.trim())) next.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
    if (form.dateOfBirth) {
      const dob = new Date(form.dateOfBirth);
      if (Number.isNaN(dob.getTime()) || dob > new Date()) next.dateOfBirth = 'Ngày sinh không hợp lệ';
    }
    if (addressChanged) {
      if (addressValue.length < 5) next.address = 'Địa chỉ cần ít nhất 5 ký tự';
      else if (addressValue.length > 500) next.address = 'Địa chỉ tối đa 500 ký tự';
      else if (!PHONE_REGEX.test(receiverPhone)) next.phone = next.phone || 'Vui lòng nhập số điện thoại để lưu địa chỉ giao hàng';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const profilePayload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim() || null,
      gender: form.gender || null,
      dateOfBirth: form.dateOfBirth || null,
    };

    try {
      if (addressChanged) {
        setIsSavingAddress(true);
        const addressPayload = {
          receiverName,
          phone: receiverPhone,
          addressLine: addressValue,
          ward: null,
          district: null,
          province: null,
          isDefault: true,
        };
        if (defaultAddress) await addressService.updateAddress(defaultAddress.id, addressPayload);
        else await addressService.createAddress(addressPayload);
        await queryClient.invalidateQueries({ queryKey: ['addresses'] });
      }
      await updateProfile(profilePayload);
      if (addressChanged) await refreshProfile();
      toast.success('Đã cập nhật hồ sơ');
      setIsEditing(false);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể cập nhật hồ sơ. Vui lòng thử lại.'));
    } finally {
      setIsSavingAddress(false);
    }
  };

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const isSaving = isUpdatingProfile || isSavingAddress;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 border-b border-light-border dark:border-dark-border pb-6">
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Hồ sơ của tôi</h1>
          <div className="flex gap-2">
            {!isEditing && (
              <Button id="profile-edit-btn" variant="primary" onClick={() => setIsEditing(true)}>
                <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa
              </Button>
            )}
            <Button id="profile-logout-btn" variant="outline" onClick={() => logout()} isLoading={isLoggingOut}>
              Đăng xuất
            </Button>
          </div>
        </div>

        {!isEditing ? (
          <div className="space-y-6">
            <InfoRow icon={User} label="Họ và tên" value={user.fullName} />
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={Phone} label="Số điện thoại" value={user.phone} />
            <InfoRow icon={Users} label="Giới tính" value={user.gender ? genderLabel(user.gender) : ''} />
            <InfoRow icon={Calendar} label="Ngày sinh" value={formatDate(user.dateOfBirth)} />
            <InfoRow icon={MapPin} label="Địa chỉ giao hàng mặc định" value={user.address} />
          </div>
        ) : (
          <form id="profile-edit-form" onSubmit={handleSave} className="space-y-8" noValidate>
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">Thông tin cá nhân</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input id="profile-fullname" label="Họ và tên" required value={form.fullName} onChange={setField('fullName')} error={errors.fullName} maxLength={255} />
                <Input id="profile-email" label="Email" value={user.email} disabled className="opacity-70 cursor-not-allowed" />
                <Input id="profile-phone" label="Số điện thoại" type="tel" value={form.phone} onChange={setField('phone')} error={errors.phone} placeholder="0912345678" />
                <Input id="profile-dob" label="Ngày sinh" type="date" value={form.dateOfBirth} onChange={setField('dateOfBirth')} error={errors.dateOfBirth} max={new Date().toISOString().slice(0, 10)} />
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="profile-gender" className="text-sm font-semibold text-light-text dark:text-dark-text">Giới tính</label>
                  <select
                    id="profile-gender"
                    value={form.gender}
                    onChange={setField('gender')}
                    className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-dark-card text-light-text dark:text-dark-text outline-none border-light-border dark:border-dark-border focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-light-muted dark:text-dark-muted">Email dùng để đăng nhập nên không thể thay đổi tại đây.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">Địa chỉ giao hàng mặc định</h2>
              <Input
                id="address-full"
                label="Địa chỉ"
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                error={errors.address}
                maxLength={500}
                placeholder="VD: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
              />
              {!defaultAddress && (
                <p className="text-xs text-light-muted dark:text-dark-muted">Bạn chưa có địa chỉ. Điền thông tin để tạo địa chỉ mặc định, hoặc để trống nếu chưa cần.</p>
              )}
            </section>

            <div className="flex justify-end gap-3 border-t border-light-border dark:border-dark-border pt-6">
              <Button id="profile-cancel-btn" type="button" variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                <X className="w-4 h-4 mr-2" /> Hủy
              </Button>
              <Button id="profile-save-btn" type="submit" variant="primary" isLoading={isSaving}>
                <Check className="w-4 h-4 mr-2" /> Lưu thay đổi
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
