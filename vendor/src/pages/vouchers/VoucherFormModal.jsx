import { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '../../components/ui';
import { voucherService } from '../../services/voucherService';
import { productService } from '../../services/productService';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatHelpers';

const emptyForm = () => ({
  code: '', name: '', discountType: 'percentage', discountValue: '', quantity: '',
  startDate: '', endDate: '', status: 'active', productIds: [],
});

function dateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateTimestamp(value, endOfDay, original) {
  if (original && value === dateInputValue(original)) return new Date(original).toISOString();
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (endOfDay) date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

export default function VoucherFormModal({ isOpen, onClose, voucherToEdit, onSave }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [knownProducts, setKnownProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [reloadProducts, setReloadProducts] = useState(0);

  useEffect(() => {
    setError('');
    setProductSearch('');
    setKnownProducts((voucherToEdit?.details || []).filter(detail => detail.productId && !detail.orderId).map(detail => ({
      id: detail.productId, name: detail.product?.name || 'Sản phẩm đã ngừng bán',
    })));
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
        productIds: [...new Set((voucherToEdit.details || []).filter(detail => detail.productId && !detail.orderId).map(detail => detail.productId))],
      });
    } else {
      setFormData(emptyForm());
    }
  }, [voucherToEdit, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
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
          const data = await productService.getVendorProducts({ page, itemPerPage: 100 });
          if (disposed || current !== request) return;
          allProducts.push(...(Array.isArray(data) ? data : data.list || []));
          totalPages = data.totalPages || 1;
          page++;
        } while (page <= totalPages);
        setProducts([...new Map(allProducts.map(product => [product.id, product])).values()]);
        setKnownProducts(current => [...new Map([...current, ...allProducts].map(product => [product.id, product])).values()]);
      } catch {
        if (!disposed && current === request) setProductsError('Không tải được sản phẩm của shop. Vui lòng thử lại.');
      } finally {
        if (!disposed && current === request) setProductsLoading(false);
      }
    };
    load();
    window.addEventListener('miva:products', load);
    return () => { disposed = true; window.removeEventListener('miva:products', load); };
  }, [isOpen, reloadProducts]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || productsLoading || productsError) return;
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
        productIds: formData.productIds,
      };
      if (payload.code.length < 3 || !payload.name) throw new Error('Mã cần ít nhất 3 ký tự và tên voucher không được để trống.');
      if (!payload.productIds.length) throw new Error('Vui lòng chọn ít nhất một sản phẩm áp dụng.');
      if (payload.productIds.length > 100) throw new Error('Mỗi voucher được chọn tối đa 100 sản phẩm.');
      if (payload.productIds.some(id => !products.some(product => product.id === id))) throw new Error('Có sản phẩm không còn khả dụng. Hãy bỏ chọn và chọn lại sản phẩm của shop.');
      if (!Number.isFinite(payload.discountValue) || payload.discountValue <= 0) throw new Error('Giá trị giảm phải lớn hơn 0.');
      if (payload.discountType === 'percentage' && payload.discountValue > 100) throw new Error('Phần trăm giảm không được vượt quá 100.');
      if (!Number.isInteger(payload.quantity) || payload.quantity <= 0) throw new Error('Số lượng voucher phải là số nguyên lớn hơn 0.');
      if (payload.perUserLimit > payload.quantity) throw new Error('Số lượng voucher không được nhỏ hơn giới hạn mỗi người.');
      if (new Date(payload.endDate) <= new Date(payload.startDate)) throw new Error('Ngày kết thúc phải sau thời điểm bắt đầu.');
      setIsSubmitting(true);
      if (voucherToEdit) {
        await voucherService.updateVoucher(voucherToEdit.id, payload);
      } else {
        await voucherService.createVoucher(payload);
      }
      await onSave();
    } catch (err) {
      const data = err.response?.data;
      const messages = data?.errors?.map(item => item.message).filter(Boolean);
      setError(messages?.length ? messages.join(' ') : data?.message || err.message || 'Lưu voucher thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const productOptions = new Map(products.map(product => [product.id, { ...product, available: true }]));
  for (const product of knownProducts) {
    if (formData.productIds.includes(product.id) && !productOptions.has(product.id)) {
      productOptions.set(product.id, { ...product, available: false });
    }
  }
  const filteredProducts = [...productOptions.values()].filter(product => product.name.toLowerCase().includes(productSearch.trim().toLowerCase()));

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { if (!isSubmitting) onClose(); }}
      title={voucherToEdit ? "Edit Shop Voucher" : "Create Shop Voucher"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" form="vendor-voucher-form" className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2" disabled={isSubmitting || productsLoading || Boolean(productsError)}>
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Voucher
          </Button>
        </>
      }
    >
      <form id="vendor-voucher-form" onSubmit={handleSubmit}>
        {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
        <fieldset disabled={isSubmitting} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Voucher Code *" 
          aria-label="Voucher Code" required minLength={3} maxLength={50}
          placeholder="e.g. MYSHOP10" 
          value={formData.code}
          onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
        />
        <Input 
          label="Voucher Name *" 
          aria-label="Voucher Name" required maxLength={255}
          placeholder="e.g. 10% Off Shop" 
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
          placeholder="e.g. 10" 
          value={formData.discountValue}
          onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
        />
        <Input 
          label="Start Date *"
          aria-label="Start Date" required
          type="date"
          value={formData.startDate}
          onChange={e => setFormData({ ...formData, startDate: e.target.value })}
        />
        <Input 
          label="End Date *"
          aria-label="End Date" required
          type="date"
          value={formData.endDate}
          onChange={e => setFormData({ ...formData, endDate: e.target.value })}
        />
        <Input 
          label="Quantity Limit *"
          aria-label="Quantity Limit"
          type="number"
          required min="1" step="1" max="2147483647"
          placeholder="e.g. 50" 
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
        <section className="md:col-span-2 space-y-2" aria-label="Sản phẩm áp dụng">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Sản phẩm áp dụng * ({formData.productIds.length}/100)</h3>
          <Input aria-label="Tìm sản phẩm áp dụng" placeholder="Tìm sản phẩm của shop..." value={productSearch} onChange={event => setProductSearch(event.target.value)} />
          {productsLoading ? <p role="status" className="text-sm text-slate-500">Đang tải sản phẩm...</p> : productsError ? (
            <div role="alert" className="text-sm text-red-600">
              {productsError} <button type="button" className="underline" onClick={() => setReloadProducts(value => value + 1)}>Thử lại</button>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 p-2 space-y-1">
              {filteredProducts.map(product => {
                const checked = formData.productIds.includes(product.id);
                return (
                  <label key={product.id} className="flex items-center gap-2 p-2 text-sm text-slate-700 dark:text-slate-300">
                    <input type="checkbox" checked={checked} disabled={!checked && (!product.available || formData.productIds.length >= 100)} onChange={event => {
                      const selected = event.target.checked;
                      setFormData(current => ({ ...current, productIds: selected ? [...new Set([...current.productIds, product.id])] : current.productIds.filter(id => id !== product.id) }));
                    }} />
                    <span>{product.name}{!product.available ? ' (không còn khả dụng)' : ''}</span>
                  </label>
                );
              })}
              {!filteredProducts.length && <p className="p-2 text-sm text-slate-500">{products.length ? 'Không tìm thấy sản phẩm phù hợp.' : 'Shop chưa có sản phẩm. Hãy tạo sản phẩm trước khi tạo voucher.'}</p>}
            </div>
          )}
          <p className="text-xs text-slate-500">Chọn ít nhất một sản phẩm của shop. Voucher chỉ áp dụng cho các sản phẩm được chọn.</p>
          {formData.productIds.length > 0 && Number(formData.discountValue) > 0 && <section aria-label="Giá sau giảm dự kiến" className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 space-y-2 text-xs text-emerald-800 dark:text-emerald-300">
            <h4 className="font-semibold">Giá sau giảm dự kiến · đơn mua 1 sản phẩm</h4>
            {products.filter(product => formData.productIds.includes(product.id)).map(product => {
              const prices = (product.colors || []).flatMap(color => (color.variants || []).map(variant => Number(variant.price)));
              if (!prices.length) return <p key={product.id}>{product.name}: chưa có giá biến thể.</p>;
              const price = Math.min(...prices);
              let discount = formData.discountType === 'percentage' ? price * Math.min(Number(formData.discountValue), 100) / 100 : Number(formData.discountValue);
              if (voucherToEdit?.maxDiscountAmount != null) discount = Math.min(discount, Number(voucherToEdit.maxDiscountAmount));
              if (Number(voucherToEdit?.minOrderAmount || 0) > price) return <p key={product.id}>{product.name}: đơn tối thiểu {formatCurrency(voucherToEdit.minOrderAmount)}.</p>;
              return <p key={product.id}>{product.name}{prices.some(value => value !== price) ? ' (từ)' : ''}: <span className="line-through">{formatCurrency(price)}</span> → <strong>{formatCurrency(Math.max(0, price - discount))}</strong></p>;
            })}
            <p>Giảm cố định tính một lần trên tổng hàng đủ điều kiện của đơn. Giá thực tế còn phụ thuộc thời hạn, số lượng và giới hạn lượt dùng.</p>
          </section>}
        </section>
        </fieldset>
        <p className="mt-3 text-xs text-slate-500">Khi tạo mới, voucher có hiệu lực từ đầu ngày bắt đầu đến hết ngày kết thúc theo múi giờ của bạn.</p>
      </form>
    </Modal>
  );
}
