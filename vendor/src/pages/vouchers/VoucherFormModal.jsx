import { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '../../components/ui';

export default function VoucherFormModal({ isOpen, onClose, voucherToEdit, onSave }) {
  const [formData, setFormData] = useState({ 
    code: '', 
    name: '',
    discountType: 'percentage',
    discountValue: '',
    quantity: '',
    startDate: '',
    endDate: '',
    status: 'active'
  });

  useEffect(() => {
    if (voucherToEdit) {
      const sDate = voucherToEdit.startDate ? new Date(voucherToEdit.startDate).toISOString().split('T')[0] : '';
      const eDate = voucherToEdit.endDate ? new Date(voucherToEdit.endDate).toISOString().split('T')[0] : '';
      
      setFormData({
        ...voucherToEdit,
        startDate: sDate,
        endDate: eDate
      });
    } else {
      setFormData({ 
        code: '', 
        name: '',
        discountType: 'percentage',
        discountValue: '',
        quantity: '',
        startDate: '',
        endDate: '',
        status: 'active'
      });
    }
  }, [voucherToEdit, isOpen]);

  const handleSubmit = () => {
    if (!formData.code || !formData.name || !formData.discountValue) {
      alert('Please fill all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={voucherToEdit ? "Edit Shop Voucher" : "Create Shop Voucher"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSubmit}>Save Voucher</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Voucher Code *" 
          placeholder="e.g. MYSHOP10" 
          value={formData.code}
          onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
        />
        <Input 
          label="Voucher Name *" 
          placeholder="e.g. 10% Off Shop" 
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
        />
        <Select 
          label="Discount Type"
          options={[
            { value: 'percentage', label: 'Percentage (%)' },
            { value: 'fixed', label: 'Fixed Amount (VND)' }
          ]}
          value={formData.discountType}
          onChange={e => setFormData({ ...formData, discountType: e.target.value })}
        />
        <Input 
          label="Discount Value *" 
          type="number"
          placeholder="e.g. 10" 
          value={formData.discountValue}
          onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
        />
        <Input 
          label="Start Date" 
          type="date"
          value={formData.startDate}
          onChange={e => setFormData({ ...formData, startDate: e.target.value })}
        />
        <Input 
          label="End Date" 
          type="date"
          value={formData.endDate}
          onChange={e => setFormData({ ...formData, endDate: e.target.value })}
        />
        <Input 
          label="Quantity Limit" 
          type="number"
          placeholder="e.g. 50" 
          value={formData.quantity}
          onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
        />
        <Select 
          label="Status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]}
          value={formData.status}
          onChange={e => setFormData({ ...formData, status: e.target.value })}
        />
      </div>
    </Modal>
  );
}
