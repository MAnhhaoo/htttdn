import { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '../../components/ui';

const emptyForm = () => ({
  code: '', name: '', discountType: 'percentage', discountValue: '',
  quantity: '', startDate: '', endDate: '', status: 'active',
});

function dateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateTimestamp(value, endOfDay, original) {
  // Keep the original time when editing another field on an existing voucher.
  if (original && value === dateInputValue(original)) return new Date(original).toISOString();
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (endOfDay) date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

export default function VoucherFormModal({ isOpen, onClose, voucherToEdit, onSave }) {
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setError('');
    if (voucherToEdit) {
      setFormData({
        code: voucherToEdit.code,
        name: voucherToEdit.name,
        discountType: voucherToEdit.discountType,
        discountValue: voucherToEdit.discountValue,
        quantity: voucherToEdit.quantity,
        startDate: dateInputValue(voucherToEdit.startDate),
        endDate: dateInputValue(voucherToEdit.endDate),
        status: voucherToEdit.status,
      });
    } else {
      setFormData(emptyForm());
    }
  }, [voucherToEdit, isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setError('');
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        quantity: Number(formData.quantity),
        perUserLimit: voucherToEdit?.perUserLimit ?? 1,
        startDate: dateTimestamp(formData.startDate, false, voucherToEdit?.startDate),
        endDate: dateTimestamp(formData.endDate, true, voucherToEdit?.endDate),
        status: formData.status,
      };
      if (payload.code.length < 3 || !payload.name) throw new Error('Mã cần ít nhất 3 ký tự và tên voucher không được để trống.');
      if (!Number.isFinite(payload.discountValue) || payload.discountValue <= 0) throw new Error('Giá trị giảm phải lớn hơn 0.');
      if (payload.discountType === 'percentage' && payload.discountValue > 100) throw new Error('Phần trăm giảm không được vượt quá 100.');
      if (!Number.isInteger(payload.quantity) || payload.quantity <= 0) throw new Error('Số lượng voucher phải là số nguyên lớn hơn 0.');
      if (payload.perUserLimit > payload.quantity) throw new Error('Số lượng voucher không được nhỏ hơn giới hạn mỗi người.');
      if (new Date(payload.endDate) <= new Date(payload.startDate)) throw new Error('Ngày kết thúc phải sau thời điểm bắt đầu.');
      setSaving(true);
      await onSave(payload);
    } catch (err) {
      const data = err.response?.data;
      const messages = data?.errors?.map(item => item.message).filter(Boolean);
      setError(messages?.length ? messages.join(' ') : data?.message || err.message || 'Lưu voucher thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { if (!saving) onClose(); }}
      title={voucherToEdit ? "Edit Voucher" : "Add New Voucher"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" type="submit" form="admin-voucher-form" disabled={saving}>{saving ? 'Đang lưu...' : 'Save Voucher'}</Button>
        </>
      }
    >
      <form id="admin-voucher-form" onSubmit={handleSubmit}>
        {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
        <fieldset disabled={saving} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Voucher Code *" 
          aria-label="Voucher Code"
          required minLength={3} maxLength={50}
          placeholder="e.g. SUMMER2024" 
          value={formData.code}
          onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
        />
        <Input 
          label="Voucher Name *" 
          aria-label="Voucher Name"
          required maxLength={255}
          placeholder="e.g. Summer Sale 20%" 
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
        />
        <Select 
          label="Discount Type"
          aria-label="Discount Type"
          options={[
            { value: 'percentage', label: 'Percentage (%)' },
            { value: 'fixed_amount', label: 'Fixed Amount (VND)' }
          ]}
          value={formData.discountType}
          onChange={e => setFormData({ ...formData, discountType: e.target.value })}
        />
        <Input 
          label="Discount Value *" 
          aria-label="Discount Value"
          type="number"
          required min="0.01" step="0.01" max={formData.discountType === 'percentage' ? 100 : 9999999999.99}
          placeholder="e.g. 20" 
          value={formData.discountValue}
          onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
        />
        <Input 
          label="Start Date *"
          aria-label="Start Date"
          type="date"
          required
          value={formData.startDate}
          onChange={e => setFormData({ ...formData, startDate: e.target.value })}
        />
        <Input 
          label="End Date *"
          aria-label="End Date"
          type="date"
          required
          value={formData.endDate}
          onChange={e => setFormData({ ...formData, endDate: e.target.value })}
        />
        <Input 
          label="Quantity Limit *"
          aria-label="Quantity Limit"
          type="number"
          required min="1" step="1" max="2147483647"
          placeholder="e.g. 100" 
          value={formData.quantity}
          onChange={e => setFormData({ ...formData, quantity: e.target.value })}
        />
        <Select 
          label="Status"
          aria-label="Status"
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'expired', label: 'Expired' }
          ]}
          value={formData.status}
          onChange={e => setFormData({ ...formData, status: e.target.value })}
        />
        </fieldset>
        <p className="mt-3 text-xs text-slate-500">Khi tạo mới, voucher có hiệu lực từ đầu ngày bắt đầu đến hết ngày kết thúc theo múi giờ của bạn.</p>
      </form>
    </Modal>
  );
}
