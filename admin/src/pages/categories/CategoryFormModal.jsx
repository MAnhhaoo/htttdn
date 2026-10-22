import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal, Button, Input } from '../../components/ui';

export default function CategoryFormModal({ isOpen, onClose, categoryToEdit, onSave }) {
  const [formData, setFormData] = useState({ name: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        name: categoryToEdit.name || '',
      });
    } else {
      setFormData({ name: '' });
    }
  }, [categoryToEdit, isOpen]);

  const handleSubmit = async () => {
    const name = formData.name.trim();
    if (!name) {
      alert('Tên danh mục là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      await onSave({ name });
    } catch {
      // Error handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Hủy</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...
              </span>
            ) : 'Lưu danh mục'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input 
          label="Tên danh mục *" 
          placeholder="VD: Sneakers" 
          value={formData.name}
          maxLength={255}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
    </Modal>
  );
}
