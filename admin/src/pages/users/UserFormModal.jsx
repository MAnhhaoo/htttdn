import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal, Button, Input, Select } from '../../components/ui';

export default function UserFormModal({ isOpen, onClose, userToEdit, onSave }) {
  const [formData, setFormData] = useState({ fullName: '', email: '', role: 'customer', status: 'active' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        fullName: userToEdit.fullName || '',
        email: userToEdit.email || '',
        role: userToEdit.role || 'customer',
        status: userToEdit.status || 'active',
        phone: userToEdit.phone || '',
        address: userToEdit.address || '',
      });
    } else {
      setFormData({ fullName: '', email: '', role: 'customer', status: 'active', phone: '', address: '' });
    }
  }, [userToEdit, isOpen]);

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email) {
      alert('Tên và Email là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={userToEdit ? "Chỉnh sửa User" : "Thêm User"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Hủy</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...
              </span>
            ) : 'Lưu User'}
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
          placeholder="john@example.com" 
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          disabled={!!userToEdit} // Không cho đổi email khi edit
        />
        <Input 
          label="Số điện thoại" 
          placeholder="0900000000" 
          value={formData.phone || ''}
          onChange={e => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input 
          label="Địa chỉ" 
          placeholder="Hà Nội" 
          value={formData.address || ''}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
        />
        <Select 
          label="Role"
          options={[
            { value: 'customer', label: 'Customer' },
            { value: 'seller', label: 'Seller' },
            { value: 'admin', label: 'Admin' }
          ]}
          value={formData.role}
          onChange={e => setFormData({ ...formData, role: e.target.value })}
        />
        <Select 
          label="Status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]}
          value={formData.status || 'active'}
          onChange={e => setFormData({ ...formData, status: e.target.value })}
        />
      </div>
    </Modal>
  );
}
