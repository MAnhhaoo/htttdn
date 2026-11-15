import { useState, useEffect } from 'react';
import { Layers, Globe, CheckSquare, Square, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { formatCurrency } from '../../utils/formatHelpers';
import {
  dateInputValue,
  buildBaseVoucherPayload,
  validateBaseVoucherPayload,
  extractVoucherErrorMessage,
} from '../../utils/voucherFormHelpers';

const emptyForm = () => ({
  code: '',
  name: '',
  discountType: 'percentage',
  discountValue: '',
  quantity: '',
  startDate: '',
  endDate: '',
  status: 'active',
  targetMode: 'all',
  categoryIds: [],
  productIds: [],
});

/**
 * Form Tạo / Chỉnh sửa Voucher dùng chung cho cả Admin (`mode="admin"`) và Vendor (`mode="vendor"`).
 */
export function BaseVoucherFormModal({
  mode = 'admin',
  isOpen,
  onClose,
  voucherToEdit,
  onSave,
  fetchCategoriesFn,
  fetchVendorProductsFn,
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Admin category state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Vendor product state
  const [products, setProducts] = useState([]);
  const [knownProducts, setKnownProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [reloadProducts, setReloadProducts] = useState(0);

  const isVendorMode = mode === 'vendor';
  const isEditingVendorVoucherInAdmin = !isVendorMode && voucherToEdit?.scope === 'vendor';

  useEffect(() => {
    setError('');
    setProductSearch('');
    if (voucherToEdit) {
      const existingCategoryIds = Array.isArray(voucherToEdit.categoryIds)
        ? voucherToEdit.categoryIds
        : [];
      const existingProductDetails = (voucherToEdit.details || []).filter(
        (d) => d.productId && !d.orderId,
      );
      setKnownProducts(
        existingProductDetails.map((d) => ({
          id: d.productId,
          name: d.product?.name || 'Sản phẩm đã ngừng bán',
        })),
      );
      setFormData({
        code: voucherToEdit.code || '',
        name: voucherToEdit.name || '',
        discountType: voucherToEdit.discountType || 'percentage',
        discountValue: voucherToEdit.discountValue ?? '',
        quantity: voucherToEdit.quantity ?? '',
        startDate: dateInputValue(voucherToEdit.startDate),
        endDate: dateInputValue(voucherToEdit.endDate),
        status: voucherToEdit.status || 'active',
        targetMode: existingCategoryIds.length > 0 ? 'categories' : 'all',
        categoryIds: existingCategoryIds,
        productIds: [...new Set(existingProductDetails.map((d) => d.productId))],
      });
    } else {
      setKnownProducts([]);
      setFormData(emptyForm());
    }
  }, [voucherToEdit, isOpen]);

  useEffect(() => {
    if (!isOpen || isVendorMode || !fetchCategoriesFn) return;
    let mounted = true;
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await fetchCategoriesFn({ itemPerPage: 100 });
        const raw = res?.data ?? res;
        const list = raw?.list ? raw.list : Array.isArray(raw) ? raw : [];
        if (mounted) setCategories(list);
      } catch (err) {
        console.error('Error fetching categories for voucher modal:', err);
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    };
    loadCategories();
    return () => {
      mounted = false;
    };
  }, [isOpen, isVendorMode, fetchCategoriesFn]);

  useEffect(() => {
    if (!isOpen || !isVendorMode || !fetchVendorProductsFn) return;
    let disposed = false;
    let request = 0;
    const load = async () => {
      const current = ++request;
      setProductsLoading(true);
      setProductsError('');
      try {
        const allProducts = [];
        let page = 1;
        let totalPages = 1;
        do {
          const res = await fetchVendorProductsFn({ page, itemPerPage: 100 });
          const data = res?.data ?? res;
          if (disposed || current !== request) return;
          allProducts.push(...(Array.isArray(data) ? data : data?.list || []));
          totalPages = data?.totalPages || 1;
          page++;
        } while (page <= totalPages);
        setProducts([...new Map(allProducts.map((p) => [p.id, p])).values()]);
        setKnownProducts((curr) => [
          ...new Map([...curr, ...allProducts].map((p) => [p.id, p])).values(),
        ]);
      } catch {
        if (!disposed && current === request) {
          setProductsError('Không tải được sản phẩm của shop. Vui lòng thử lại.');
        }
      } finally {
        if (!disposed && current === request) setProductsLoading(false);
      }
    };
    load();
    window.addEventListener('miva:products', load);
    return () => {
      disposed = true;
      window.removeEventListener('miva:products', load);
    };
  }, [isOpen, isVendorMode, fetchVendorProductsFn, reloadProducts]);

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
    const allSelected =
      allIds.length > 0 && allIds.every((id) => formData.categoryIds.includes(id));
    setFormData((prev) => ({
      ...prev,
      categoryIds: allSelected ? [] : allIds,
    }));
  };

  const productOptions = new Map(products.map((p) => [p.id, { ...p, available: true }]));
  for (const p of knownProducts) {
    if (formData.productIds.includes(p.id) && !productOptions.has(p.id)) {
      productOptions.set(p.id, { ...p, available: false });
    }
  }
  const filteredProducts = [...productOptions.values()].filter((p) =>
    (p.name || '').toLowerCase().includes(productSearch.trim().toLowerCase()),
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || (isVendorMode && (productsLoading || productsError))) return;
    setError('');
    try {
      const payload = buildBaseVoucherPayload(formData, voucherToEdit);

      if (isVendorMode) {
        payload.productIds = formData.productIds;
        if (!payload.productIds.length) {
          throw new Error('Vui lòng chọn ít nhất một sản phẩm áp dụng.');
        }
        if (payload.productIds.length > 100) {
          throw new Error('Mỗi voucher được chọn tối đa 100 sản phẩm.');
        }
        if (payload.productIds.some((id) => !products.some((p) => p.id === id))) {
          throw new Error(
            'Có sản phẩm không còn khả dụng. Hãy bỏ chọn và chọn lại sản phẩm của shop.',
          );
        }
      } else if (!isEditingVendorVoucherInAdmin) {
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

  const formId = `${mode}-shared-voucher-form`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!saving) onClose();
      }}
      title={
        voucherToEdit
          ? isVendorMode
            ? 'Chỉnh sửa Voucher Gian hàng'
            : 'Chỉnh sửa Mã giảm giá'
          : isVendorMode
            ? 'Tạo Voucher Gian hàng mới'
            : 'Thêm Mã giảm giá mới'
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={formId}
            disabled={saving || (isVendorMode && (productsLoading || Boolean(productsError)))}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
            {saving ? 'Đang lưu...' : 'Lưu Voucher'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit}>
        {error && (
          <p role="alert" className="mb-4 text-sm text-red-600 font-medium">
            {error}
          </p>
        )}
        <fieldset disabled={saving} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Mã Voucher *"
            aria-label="Voucher Code"
            required
            minLength={3}
            maxLength={50}
            placeholder={isVendorMode ? 'VD: MYSHOP10' : 'VD: MIVASALE20'}
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          />
          <Input
            label="Tên chương trình *"
            aria-label="Voucher Name"
            required
            maxLength={255}
            placeholder="VD: Ưu đãi giảm 20%"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Select
            label="Loại giảm giá"
            aria-label="Discount Type"
            options={[
              { value: 'percentage', label: 'Phần trăm (%)' },
              { value: 'fixed_amount', label: 'Số tiền cố định (VNĐ)' },
            ]}
            value={formData.discountType}
            onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
          />
          <Input
            label="Giá trị giảm *"
            aria-label="Discount Value"
            type="number"
            required
            min="0.01"
            step="0.01"
            max={formData.discountType === 'percentage' ? 100 : 9999999999.99}
            placeholder="VD: 20"
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
          />
          <Input
            label="Ngày bắt đầu *"
            aria-label="Start Date"
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
          <Input
            label="Ngày kết thúc *"
            aria-label="End Date"
            type="date"
            required
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
          <Input
            label="Giới hạn lượt dùng *"
            aria-label="Quantity Limit"
            type="number"
            required
            min="1"
            step="1"
            max="2147483647"
            placeholder="VD: 100"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          />
          <Select
            label="Trạng thái"
            aria-label="Status"
            options={[
              { value: 'draft', label: 'Bản nháp (Draft)' },
              { value: 'active', label: 'Hoạt động (Active)' },
              { value: 'inactive', label: 'Tạm dừng (Inactive)' },
              { value: 'expired', label: 'Hết hạn (Expired)' },
            ]}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          />

          {isVendorMode && (
            <section className="md:col-span-2 space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800" aria-label="Sản phẩm áp dụng">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Sản phẩm áp dụng * ({formData.productIds.length}/100)
              </h3>
              <Input
                aria-label="Tìm sản phẩm áp dụng"
                placeholder="Tìm sản phẩm của shop..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              {productsLoading ? (
                <p role="status" className="text-sm text-slate-500">
                  Đang tải sản phẩm...
                </p>
              ) : productsError ? (
                <div role="alert" className="text-sm text-red-600">
                  {productsError}{' '}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => setReloadProducts((v) => v + 1)}
                  >
                    Thử lại
                  </button>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 p-2 space-y-1">
                  {filteredProducts.map((product) => {
                    const checked = formData.productIds.includes(product.id);
                    return (
                      <label
                        key={product.id}
                        className="flex items-center gap-2 p-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!checked && (!product.available || formData.productIds.length >= 100)}
                          onChange={(e) => {
                            const selected = e.target.checked;
                            setFormData((curr) => ({
                              ...curr,
                              productIds: selected
                                ? [...new Set([...curr.productIds, product.id])]
                                : curr.productIds.filter((id) => id !== product.id),
                            }));
                          }}
                        />
                        <span>
                          {product.name}
                          {!product.available ? ' (không còn khả dụng)' : ''}
                        </span>
                      </label>
                    );
                  })}
                  {!filteredProducts.length && (
                    <p className="p-2 text-sm text-slate-500">
                      {products.length
                        ? 'Không tìm thấy sản phẩm phù hợp.'
                        : 'Shop chưa có sản phẩm. Hãy tạo sản phẩm trước khi tạo voucher.'}
                    </p>
                  )}
                </div>
              )}

              {formData.productIds.length > 0 && Number(formData.discountValue) > 0 && (
                <section
                  aria-label="Giá sau giảm dự kiến"
                  className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 space-y-1.5 text-xs text-emerald-800 dark:text-emerald-300"
                >
                  <h4 className="font-semibold">Giá sau giảm dự kiến &bull; đơn mua 1 sản phẩm</h4>
                  {products
                    .filter((p) => formData.productIds.includes(p.id))
                    .slice(0, 5)
                    .map((product) => {
                      const prices = (product.colors || []).flatMap((color) =>
                        (color.variants || []).map((v) => Number(v.price)),
                      );
                      if (!prices.length) {
                        return <p key={product.id}>{product.name}: chưa có giá biến thể.</p>;
                      }
                      const price = Math.min(...prices);
                      let discount =
                        formData.discountType === 'percentage'
                          ? (price * Math.min(Number(formData.discountValue), 100)) / 100
                          : Number(formData.discountValue);
                      if (voucherToEdit?.maxDiscountAmount != null) {
                        discount = Math.min(discount, Number(voucherToEdit.maxDiscountAmount));
                      }
                      return (
                        <p key={product.id}>
                          {product.name}:{' '}
                          <span className="line-through">{formatCurrency(price)}</span> →{' '}
                          <strong>{formatCurrency(Math.max(0, price - discount))}</strong>
                        </p>
                      );
                    })}
                </section>
              )}
            </section>
          )}
        </fieldset>

        {!isVendorMode && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Phạm vi áp dụng sản phẩm
            </label>

            {isEditingVendorVoucherInAdmin ? (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                Voucher của Shop{' '}
                <span className="font-semibold">
                  {voucherToEdit.vendor?.storeName || voucherToEdit.vendor?.fullName || 'Vendor'}
                </span>{' '}
                ({voucherToEdit.details?.length || 0} sản phẩm áp dụng).
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
                        ? 'border-[#2A5C4A] bg-[#EEF5F1]/80 dark:bg-[#1A3A2C]/40 text-[#1A3A2C] dark:text-[#8BBAA1] ring-1 ring-[#2A5C4A]'
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
                        ? 'border-[#2A5C4A] bg-[#EEF5F1]/80 dark:bg-[#1A3A2C]/40 text-[#1A3A2C] dark:text-[#8BBAA1] ring-1 ring-[#2A5C4A]'
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
                        Đã chọn{' '}
                        <strong className="text-[#1A3A2C] dark:text-[#8BBAA1]">
                          {formData.categoryIds.length}
                        </strong>{' '}
                        / {categories.length} danh mục
                      </span>
                      {categories.length > 0 && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={handleToggleAllCategories}
                          className="text-xs font-medium text-[#1A3A2C] hover:text-[#2A5C4A] dark:text-[#8BBAA1]"
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
                      <p className="text-xs text-amber-600 py-2">Chưa có danh mục nào.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                        {categories.map((cat) => {
                          const checked = formData.categoryIds.includes(cat.id);
                          return (
                            <label
                              key={cat.id}
                              className={`flex items-center gap-2 px-2.5 py-2 rounded-md border text-xs cursor-pointer select-none transition-colors ${
                                checked
                                  ? 'border-[#2A5C4A] bg-[#EEF5F1] dark:bg-[#1A3A2C]/45 text-[#1A3A2C] dark:text-[#DCEAE2] font-medium'
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
                                <CheckSquare className="w-4 h-4 text-[#1A3A2C] dark:text-[#8BBAA1] shrink-0" />
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
        )}

        <p className="mt-3 text-xs text-slate-500">
          Khi tạo mới, voucher có hiệu lực từ đầu ngày bắt đầu đến hết ngày kết thúc theo múi giờ của bạn.
        </p>
      </form>
    </Modal>
  );
}

export default BaseVoucherFormModal;

