import { useState } from 'react';
import { useVoucherOffers } from '../../hooks/useVoucherOffers';
import { formatPrice } from '../../utils/formatPrice';

export default function VoucherPricing({ items, pricing }) {
  const [drafts, setDrafts] = useState({});
  const offers = useVoucherOffers(items.map(item => item.productVariant?.productColor?.product?.id));
  const groups = [...new Set(items.map(item => item.productVariant?.productColor?.product?.vendorId || 'platform'))];
  const apply = (vendorId, codes) => {
    pricing.setCodes(vendorId, codes);
    setDrafts(current => ({ ...current, [vendorId]: codes.join(', ') }));
  };
  return (
    <section aria-label="Mã giảm giá" className="space-y-4 border-t border-light-border dark:border-dark-border pt-4">
      <h3 className="font-bold text-light-text dark:text-dark-text">Mã giảm giá</h3>
      {groups.map(vendorId => {
        const groupItems = items.filter(item => (item.productVariant?.productColor?.product?.vendorId || 'platform') === vendorId);
        const name = groupItems[0]?.productVariant?.productColor?.product?.vendor?.storeName || 'Cửa hàng MIVA';
        const codes = pricing.selections.find(selection => selection.vendorId === vendorId)?.codes || [];
        const groupOffers = offers.filter(offer =>
          offer.scope === 'platform'
            ? (!offer.productIds?.length || groupItems.some(item => offer.productIds.includes(item.productVariant.productColor.product.id)))
            : (offer.vendorId === vendorId && groupItems.some(item => offer.productIds.includes(item.productVariant.productColor.product.id)))
        );
        const pack = pricing.data?.packages.find(value => value.vendorId === vendorId);
        return <div key={vendorId} className="space-y-2 text-sm" data-vendor-pricing={vendorId}>
          <label htmlFor={`voucher-${vendorId}`} className="block font-medium text-light-text dark:text-dark-text">{name}</label>
          <div className="flex gap-2">
            <input id={`voucher-${vendorId}`} aria-label={`Mã giảm giá ${name}`} placeholder="Mã shop, mã toàn sàn" value={drafts[vendorId] ?? codes.join(', ')} onChange={event => setDrafts(current => ({ ...current, [vendorId]: event.target.value.toUpperCase() }))} className="min-w-0 flex-1 rounded-lg border p-2 bg-transparent text-light-text dark:text-dark-text" />
            <button type="button" className="text-primary font-semibold" onClick={() => apply(vendorId, [...new Set((drafts[vendorId] ?? codes.join(', ')).split(',').map(code => code.trim().toUpperCase()).filter(Boolean))])}>Áp dụng</button>
          </div>
          <p className="text-xs text-light-muted dark:text-dark-muted">Tối đa 1 mã shop và 1 mã toàn sàn cho mỗi đơn.</p>
          {!!codes.length && <button type="button" className="text-xs text-rose-600" onClick={() => apply(vendorId, [])}>Bỏ mã: {codes.join(', ')}</button>}
          <div className="flex flex-wrap gap-1">
            {groupOffers.map(offer => <button key={offer.id} type="button" className="rounded border border-primary/30 px-2 py-1 text-xs text-primary" title={`${offer.name}${offer.minOrderAmount ? ` · Đơn từ ${formatPrice(offer.minOrderAmount)}` : ''}${offer.maxDiscountAmount ? ` · Giảm tối đa ${formatPrice(offer.maxDiscountAmount)}` : ''}`} onClick={() => {
              const others = codes.filter(code => code !== offer.code && offers.find(value => value.code === code)?.scope !== offer.scope);
              apply(vendorId, [...others, offer.code]);
            }}>Dùng mã {offer.code}</button>)}
          </div>
          {pack && <div className="flex justify-between text-xs text-emerald-700 dark:text-emerald-400"><span>Sau giảm {formatPrice(pack.discountAmount)}</span><strong>{formatPrice(pack.totalAmount)}</strong></div>}
        </div>;
      })}
      {pricing.loading && <p role="status" className="text-xs text-light-muted dark:text-dark-muted">Đang tính giá sau giảm...</p>}
      {pricing.error && <div role="alert" className="text-sm text-rose-600">{pricing.error} <button type="button" className="underline" onClick={pricing.refresh}>Thử lại</button></div>}
    </section>
  );
}
