import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal, Button, Input, Select, AvatarUploadField } from '../../components/ui';

export default function UserFormModal({ isOpen, onClose, userToEdit, onSave }) {
  const [formData, setFormData] = useState({ fullName: '', email: '', role: 'customer', status: 'active' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        fullName: userToEdit.fullName || '',
        email: userToEdit.email || '',
        password: '',
        role: userToEdit.role || 'customer',
        status: userToEdit.status || 'active',
        phone: userToEdit.phone || '',
        gender: userToEdit.gender || '',
        dateOfBirth: userToEdit.dateOfBirth ? String(userToEdit.dateOfBirth).slice(0, 10) : '',
        address: userToEdit.address || '',
        avatarUrl: userToEdit.avatarUrl || '',
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        password: '',
        role: 'customer',
        status: 'active',
        phone: '',
        gender: '',
        dateOfBirth: '',
        address: '',
        avatarUrl: '',
      });
    }
  }, [userToEdit, isOpen]);

  const handleSubmit = async () => {
    if (!formData.fullName?.trim() || !formData.email?.trim()) {
      alert('Họ tên và Email là bắt buộc');
      return;
    }
    if (!userToEdit && formData.password && formData.password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        status: formData.status || 'active',
        phone: formData.phone?.trim() || null,
        address: formData.address?.trim() || null,
        avatarUrl: formData.avatarUrl?.trim() || null,
        gender: formData.gender || null,
        dateOfBirth: formData.dateOfBirth || null,
      };
      if (!userToEdit) {
        payload.role = 'customer';
        if (formData.password?.trim()) {
          payload.password = formData.password.trim();
        }
      }
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={userToEdit ? 'Chỉnh sửa Khách hàng / User' : 'Thêm Khách hàng mới'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Hủy</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...
              </span>
            ) : (userToEdit ? 'Lưu thay đổi' : 'Tạo khách hàng')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input 
          label="Họ tên *" 
          placeholder="Nguyễn Văn A" 
          value={formData.fullName}
          onChange={e => setFormData({ ...formData, fullName: e.target.value })}
        />
        <Input 
          label="Email *" 
          type="email"
          placeholder="khachhang@miva.vn" 
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          disabled={!!userToEdit}
        />
        {!userToEdit && (
          <Input 
            label="Mật khẩu ban đầu" 
            type="password"
            placeholder="Tối thiểu 6 ký tự (mặc định: admin123)" 
            value={formData.password || ''}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input 
            label="Số điện thoại" 
            placeholder="0900000000" 
            value={formData.phone || ''}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input 
            label="Ngày sinh" 
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
          />
        </div>
        <Select 
          label="Giới tính"
          options={[
            { value: '', label: 'Chưa chọn' },
            { value: 'male', label: 'Nam' },
            { value: 'female', label: 'Nữ' },
            { value: 'other', label: 'Khác' }
          ]}
          value={formData.gender || ''}
          onChange={e => setFormData({ ...formData, gender: e.target.value })}
        />
        <Input 
          label="Địa chỉ" 
          placeholder="123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh" 
          value={formData.address || ''}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
        />
        <AvatarUploadField
          label="Ảnh đại diện"
          avatarUrl={formData.avatarUrl}
          altName={formData.fullName || 'Avatar'}
          onChange={(url) => setFormData((prev) => ({ ...prev, avatarUrl: url }))}
        />
        <Select 
          label="Trạng thái"
          options={[
            { value: 'active', label: 'Active (Hoạt động)' },
            { value: 'inactive', label: 'Inactive (Đã khóa)' }
          ]}
          value={formData.status || 'active'}
          onChange={e => setFormData({ ...formData, status: e.target.value })}
        />
      </div>
    </Modal>
  );
}
