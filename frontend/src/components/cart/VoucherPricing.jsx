import { useState } from 'react';
import { Store, Ticket, Tag } from 'lucide-react';
import { useVoucherOffers } from '../../hooks/useVoucherOffers';
import { formatPrice } from '../../utils/formatPrice';

/**
 * Phần nhập và chọn mã giảm giá riêng của từng Vendor / Shop (Hình 1)
 * Chỉ áp dụng mã giảm giá của Vendor cho kiện hàng của Vendor đó.
 * Tuyệt đối không ăn mã giảm giá toàn sàn ở đây.
 */
export default function VoucherPricing({ items, pricing }) {
  const [drafts, setDrafts] = useState({});
  const [errors, setErrors] = useState({});
  const offers = useVoucherOffers(items.map(item => item.productVariant?.productColor?.product?.id));
  const groups = [...new Set(items.map(item => item.productVariant?.productColor?.product?.vendorId || 'platform'))];

  const handleApplyVendor = (vendorId) => {
    const raw = (drafts[vendorId] ?? '').trim().toUpperCase();
    if (!raw) {
      pricing.setVendorCodes(vendorId, []);
      setDrafts(c => ({ ...c, [vendorId]: '' }));
      setErrors(c => ({ ...c, [vendorId]: '' }));
      return;
    }

    // Kiểm tra nếu là mã toàn sàn
    const isPlatform = offers.some(o => o.code === raw && o.scope === 'platform');
    if (isPlatform) {
      setErrors(c => ({
        ...c,
        [vendorId]: `Mã "${raw}" là mã toàn sàn do Admin tạo. Vui lòng nhập ở ô Mã giảm giá toàn sàn bên dưới.`
      }));
      return;
    }

    // Kiểm tra nếu mã thuộc về shop khác
    const isOtherVendor = offers.some(o => o.code === raw && o.scope === 'vendor' && o.vendorId !== vendorId);
    if (isOtherVendor) {
      setErrors(c => ({
        ...c,
        [vendorId]: `Mã "${raw}" thuộc shop khác, không áp dụng cho shop này.`
      }));
      return;
    }

    setErrors(c => ({ ...c, [vendorId]: '' }));
    pricing.setVendorCodes(vendorId, [raw]);
    setDrafts(c => ({ ...c, [vendorId]: raw }));
  };

  const handleRemoveVendor = (vendorId) => {
    pricing.setVendorCodes(vendorId, []);
    setDrafts(c => ({ ...c, [vendorId]: '' }));
    setErrors(c => ({ ...c, [vendorId]: '' }));
  };

  return (
    <section aria-label="Mã giảm giá shop" className="space-y-4 border-t border-light-border dark:border-dark-border pt-4">
      <div className="flex items-center gap-2">
        <Store className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-light-text dark:text-dark-text text-sm">Mã giảm giá từng shop</h3>
      </div>

      {groups.map(vendorId => {
        const groupItems = items.filter(item => (item.productVariant?.productColor?.product?.vendorId || 'platform') === vendorId);
        const name = groupItems[0]?.productVariant?.productColor?.product?.vendor?.storeName || 'Cửa hàng MIVA';
        const vendorCodes = pricing.vendorCodesMap?.[vendorId] ||
          pricing.selections?.find(selection => selection.vendorId === vendorId)?.codes?.filter(c => c !== pricing.platformCode) ||
          [];

        // Chỉ hiển thị các voucher thuộc vendor này
        const groupOffers = offers.filter(offer =>
          offer.scope === 'vendor' &&
          offer.vendorId === vendorId &&
          (!offer.productIds?.length || groupItems.some(item => offer.productIds.includes(item.productVariant?.productColor?.product?.id)))
        );

        const pack = pricing.data?.packages?.find(value => value.vendorId === vendorId);
        const packVendorDiscount = pack?.applications
          ?.filter(a => a.scope === 'vendor')
          ?.reduce((sum, a) => sum + Number(a.discountAmount), 0) || 0;

        return (
          <div key={vendorId} className="space-y-2 text-sm bg-gray-50/60 dark:bg-dark-bg/40 p-3 rounded-xl border border-light-border dark:border-dark-border" data-vendor-pricing={vendorId}>
            <div className="flex items-center justify-between">
              <label htmlFor={`voucher-${vendorId}`} className="block font-semibold text-light-text dark:text-dark-text">
                {name}
              </label>
              <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                Shop
              </span>
            </div>

            <div className="flex gap-2">
              <input
                id={`voucher-${vendorId}`}
                aria-label={`Mã giảm giá ${name}`}
                placeholder="Mã giảm giá của shop..."
                value={drafts[vendorId] ?? vendorCodes.join(', ')}
                onChange={event => {
                  setDrafts(current => ({ ...current, [vendorId]: event.target.value.toUpperCase() }));
                  setErrors(current => ({ ...current, [vendorId]: '' }));
                }}
                className="min-w-0 flex-1 rounded-lg border border-light-border dark:border-dark-border p-2 text-xs bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <button
                type="button"
                className="px-3 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-lg transition cursor-pointer shadow-xs disabled:opacity-50"
                onClick={() => handleApplyVendor(vendorId)}
              >
                Áp dụng
              </button>
            </div>

            <p className="text-[11px] text-light-muted dark:text-dark-muted">
              Áp dụng mã giảm giá của shop cho kiện hàng này (Tối đa 1 mã shop).
            </p>

            {errors[vendorId] && (
              <p className="text-xs text-rose-500 font-medium" role="alert">
                {errors[vendorId]}
              </p>
            )}

            {vendorCodes.length > 0 && (
              <div className="flex items-center justify-between text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <span className="flex items-center gap-1 font-medium">
                  <Tag className="w-3 h-3 text-emerald-600" />
                  Đang dùng mã shop: <strong>{vendorCodes.join(', ')}</strong>
                </span>
                <button
                  type="button"
                  className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer ml-2 hover:underline"
                  onClick={() => handleRemoveVendor(vendorId)}
                >
                  Bỏ mã
                </button>
              </div>
            )}

            {groupOffers.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-light-border/60 dark:border-dark-border/40">
                <span className="text-[11px] font-medium text-light-muted dark:text-dark-muted block">
                  Mã shop có sẵn:
                </span>
                <div className="flex flex-wrap gap-1">
                  {groupOffers.map(offer => {
                    const isSelected = vendorCodes.includes(offer.code);
                    return (
                      <button
                        key={offer.id}
                        type="button"
                        className={`rounded border px-2 py-1 text-xs cursor-pointer transition ${
                          isSelected
                            ? 'bg-primary text-white border-primary'
                            : 'border-primary/30 text-primary bg-white/70 dark:bg-dark-card hover:bg-primary/5'
                        }`}
                        title={`${offer.name}${offer.minOrderAmount ? ` · Đơn từ ${formatPrice(offer.minOrderAmount)}` : ''}${offer.maxDiscountAmount ? ` · Giảm tối đa ${formatPrice(offer.maxDiscountAmount)}` : ''}`}
                        onClick={() => {
                          setErrors(c => ({ ...c, [vendorId]: '' }));
                          pricing.setVendorCodes(vendorId, [offer.code]);
                          setDrafts(c => ({ ...c, [vendorId]: offer.code }));
                        }}
                      >
                        Dùng mã {offer.code}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {pack && packVendorDiscount > 0 && (
              <div className="flex justify-between text-xs text-emerald-700 dark:text-emerald-400 pt-1 border-t border-dashed border-light-border dark:border-dark-border">
                <span>Shop giảm: -{formatPrice(packVendorDiscount)}</span>
                <strong>Sau giảm: {formatPrice(Number(pack.subtotalAmount) - packVendorDiscount)}</strong>
              </div>
            )}
          </div>
        );
      })}

      {pricing.loading && <p role="status" className="text-xs text-light-muted dark:text-dark-muted">Đang tính giá sau giảm...</p>}
      {pricing.error && (
        <div role="alert" className="text-xs text-rose-600 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
          {pricing.error} <button type="button" className="underline font-semibold ml-1" onClick={pricing.refresh}>Thử lại</button>
        </div>
      )}
    </section>
  );
}

/**
 * Phần nhập và chọn mã giảm giá TOÀN SÀN do Admin tạo (Hình 2)
 * Đặt ở phần TỔNG THANH TOÁN TẤT CẢ CÁC ĐƠN.
 * Chỉ ăn mã giảm giá toàn sàn (scope = platform).
 */
export function PlatformVoucherPricing({ items, pricing }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const offers = useVoucherOffers(items.map(item => item.productVariant?.productColor?.product?.id));
  const platformOffers = offers.filter(offer => offer.scope === 'platform');
  const appliedCode = pricing.platformCode;

  // Lấy tên shop nhận mã giảm giá toàn sàn (nếu có nhiều shop)
  const targetItem = items.find(i => (i.productVariant?.productColor?.product?.vendorId || 'platform') === pricing.targetPlatformVendorId);
  const targetStoreName = targetItem?.productVariant?.productColor?.product?.vendor?.storeName || 'Cửa hàng MIVA';
  const hasMultipleVendors = new Set(items.map(i => i.productVariant?.productColor?.product?.vendorId || 'platform')).size > 1;

  const handleApply = () => {
    const raw = draft.trim().toUpperCase();
    if (!raw) {
      pricing.removePlatformCode();
      setError('');
      return;
    }

    // Kiểm tra nếu là mã của shop
    const isVendorVoucher = offers.some(o => o.code === raw && o.scope === 'vendor');
    if (isVendorVoucher) {
      setError(`Mã "${raw}" là mã giảm giá của shop. Vui lòng nhập ở phần Mã giảm giá của từng shop bên trên.`);
      return;
    }

    setError('');
    pricing.setPlatformCode(raw);
    setDraft('');
  };

  const handleRemove = () => {
    pricing.removePlatformCode();
    setError('');
    setDraft('');
  };

  // Tính số tiền voucher toàn sàn giảm được
  let platformDiscount = 0;
  if (pricing.data?.packages) {
    for (const pack of pricing.data.packages) {
      const pDiscount = pack.applications
        ?.filter(a => a.scope === 'platform')
        ?.reduce((sum, a) => sum + Number(a.discountAmount), 0) || 0;
      platformDiscount += pDiscount;
    }
  }

  return (
    <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-2.5 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-light-text dark:text-dark-text">
          <Ticket className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Mã giảm giá toàn sàn </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded">
          Toàn sàn
        </span>
      </div>

      {appliedCode ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-dark-card border border-amber-300 dark:border-amber-700">
            <div>
              <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                Đang dùng mã sàn: <strong className="underline ml-0.5">{appliedCode}</strong>
              </span>
              {hasMultipleVendors && targetStoreName && (
                <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5">
                  (Áp dụng vào kiện: <span className="font-semibold text-light-text dark:text-dark-text">{targetStoreName}</span>)
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer ml-2 hover:underline"
            >
              Bỏ mã
            </button>
          </div>
          {platformDiscount > 0 && (
            <div className="flex justify-between text-xs text-amber-700 dark:text-amber-300 px-1">
              <span>Sàn giảm:</span>
              <strong className="font-bold">-{formatPrice(platformDiscount)}</strong>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              id="platform-voucher-input"
              aria-label="Mã giảm giá toàn sàn"
              placeholder="Nhập mã giảm giá toàn sàn..."
              value={draft}
              onChange={event => {
                setDraft(event.target.value.toUpperCase());
                setError('');
              }}
              className="min-w-0 flex-1 rounded-lg border border-light-border dark:border-dark-border p-2 text-xs bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleApply}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition cursor-pointer shadow-xs"
            >
              Áp dụng
            </button>
          </div>
          <p className="text-[11px] text-light-muted dark:text-dark-muted">
            Chỉ áp dụng mã giảm giá toàn sàn do sàn MIVA  phát hành.
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-500 font-medium" role="alert">
          {error}
        </p>
      )}

      {platformOffers.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-amber-200/60 dark:border-amber-800/40">
          <span className="text-[11px] font-medium text-light-muted dark:text-dark-muted block">
            Mã sàn có sẵn:
          </span>
          <div className="flex flex-wrap gap-1">
            {platformOffers.map(offer => {
              const isSelected = appliedCode === offer.code;
              return (
                <button
                  key={offer.id}
                  type="button"
                  className={`rounded border px-2 py-1 text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'border-amber-400 dark:border-amber-700 text-amber-800 dark:text-amber-300 bg-white/70 dark:bg-dark-card hover:bg-amber-100 dark:hover:bg-amber-900/40'
                  }`}
                  title={`${offer.name}${offer.minOrderAmount ? ` · Đơn từ ${formatPrice(offer.minOrderAmount)}` : ''}${offer.maxDiscountAmount ? ` · Giảm tối đa ${formatPrice(offer.maxDiscountAmount)}` : ''}`}
                  onClick={() => {
                    pricing.setPlatformCode(offer.code);
                    setError('');
                    setDraft('');
                  }}
                >
                  Dùng mã {offer.code}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
