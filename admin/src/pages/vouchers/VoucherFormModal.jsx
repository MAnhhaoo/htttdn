import { useState, useEffect } from 'react';
import { Layers, Globe, CheckSquare, Square } from 'lucide-react';
import { Modal, Button, Input, Select } from '../../components/ui';
import { categoriesApi } from '../../api';
import {
  dateInputValue,
  buildBaseVoucherPayload,
  validateBaseVoucherPayload,
  extractVoucherErrorMessage,
} from '../../utils/voucherFormHelpers';

const emptyForm = () => ({
  code: '', name: '', discountType: 'percentage', discountValue: '',
  quantity: '', startDate: '', endDate: '', status: 'active',
  targetMode: 'all', categoryIds: [],
});

export default function VoucherFormModal({ isOpen, onClose, voucherToEdit, onSave }) {
  const [formData, setFormData] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isVendorVoucher = voucherToEdit?.scope === 'vendor';

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await categoriesApi.getCategories({ itemPerPage: 100 });
        const list = res.data?.list ? res.data.list : (Array.isArray(res.data) ? res.data : []);
        if (mounted) setCategories(list);
      } catch (err) {
        console.error('Error fetching categories for voucher modal:', err);
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    };
    loadCategories();
    return () => { mounted = false; };
  }, [isOpen]);

  useEffect(() => {
    setError('');
    if (voucherToEdit) {
      const existingCategoryIds = Array.isArray(voucherToEdit.categoryIds)
        ? voucherToEdit.categoryIds
        : [];
      setFormData({
        code: voucherToEdit.code,
        name: voucherToEdit.name,
        discountType: voucherToEdit.discountType,
        discountValue: voucherToEdit.discountValue,
        quantity: voucherToEdit.quantity,
        startDate: dateInputValue(voucherToEdit.startDate),
        endDate: dateInputValue(voucherToEdit.endDate),
        status: voucherToEdit.status,
        targetMode: existingCategoryIds.length > 0 ? 'categories' : 'all',
        categoryIds: existingCategoryIds,
      });
    } else {
      setFormData(emptyForm());
    }
  }, [voucherToEdit, isOpen]);

  const toggleCategory = (categoryId) => {
    setFormData((prev) => {
      const exists = prev.categoryIds.includes(categoryId);
      const nextIds = exists
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId];
      return { ...prev, categoryIds: nextIds };
    });
  };

  const handleToggleAllCategories = () => {
    const allIds = categories.map((c) => c.id);
    const allSelected = allIds.length > 0 && allIds.every((id) => formData.categoryIds.includes(id));
    setFormData((prev) => ({
      ...prev,
      categoryIds: allSelected ? [] : allIds,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setError('');
    try {
      const payload = buildBaseVoucherPayload(formData, voucherToEdit);
      if (!isVendorVoucher) {
        if (formData.targetMode === 'categories') {
          if (!formData.categoryIds.length) {
            throw new Error('Vui lòng chọn ít nhất một danh mục áp dụng.');
          }
          payload.categoryIds = formData.categoryIds;
        } else if (voucherToEdit?.categoryIds?.length > 0) {
          payload.categoryIds = [];
        }
      }
      validateBaseVoucherPayload(payload);
      setSaving(true);
      await onSave(payload);
    } catch (err) {
      setError(extractVoucherErrorMessage(err));
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

        {/* Phạm vi áp dụng */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Phạm vi áp dụng sản phẩm
          </label>

          {isVendorVoucher ? (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              Voucher của Shop <span className="font-semibold">{voucherToEdit.vendor?.fullName || 'Vendor'}</span> ({voucherToEdit.details?.length || 0} sản phẩm áp dụng).
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setFormData({ ...formData, targetMode: 'all' })}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
                    formData.targetMode === 'all'
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Globe className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold">Tất cả sản phẩm</div>
                    <div className="text-xs opacity-75">Áp dụng toàn sàn MIVA</div>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setFormData({ ...formData, targetMode: 'categories' })}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
                    formData.targetMode === 'categories'
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold">Theo danh mục</div>
                    <div className="text-xs opacity-75">Chọn 1 hoặc nhiều danh mục</div>
                  </div>
                </button>
              </div>

              {formData.targetMode === 'categories' && (
                <div className="mt-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Đã chọn <strong className="text-blue-600 dark:text-blue-400">{formData.categoryIds.length}</strong> / {categories.length} danh mục
                    </span>
                    {categories.length > 0 && (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleToggleAllCategories}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        {categories.every((c) => formData.categoryIds.includes(c.id))
                          ? 'Bỏ chọn tất cả'
                          : 'Chọn tất cả'}
                      </button>
                    )}
                  </div>

                  {loadingCategories ? (
                    <p className="text-xs text-slate-500 py-2">Đang tải danh sách danh mục...</p>
                  ) : categories.length === 0 ? (
                    <p className="text-xs text-amber-600 py-2">Chưa có danh mục nào có sản phẩm.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                      {categories.map((cat) => {
                        const checked = formData.categoryIds.includes(cat.id);
                        return (
                          <label
                            key={cat.id}
                            className={`flex items-center gap-2 px-2.5 py-2 rounded-md border text-xs cursor-pointer select-none transition-colors ${
                              checked
                                ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 font-medium'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={checked}
                              disabled={saving}
                              onChange={() => toggleCategory(cat.id)}
                            />
                            {checked ? (
                              <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className="truncate">{cat.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-500">Khi tạo mới, voucher có hiệu lực từ đầu ngày bắt đầu đến hết ngày kết thúc theo múi giờ của bạn.</p>
      </form>
    </Modal>
  );
}
