import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal, Button, Input } from '../../components/ui';

export default function CategoryFormModal({ isOpen, onClose, categoryToEdit, onSave }) {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        name: categoryToEdit.name || '',
        description: categoryToEdit.description || '',
      });
    } else {
      setFormData({ name: '', description: '' });
    }
  }, [categoryToEdit, isOpen]);

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Tên danh mục là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      await onSave(formData);
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
          onChange={e => setFormData({ ...formData, name: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mô tả</label>
          <textarea 
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            rows={3}
            placeholder="Mô tả danh mục..."
            value={formData.description || ''}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>
    </Modal>
  );
}
