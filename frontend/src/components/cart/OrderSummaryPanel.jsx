import { useMemo } from 'react';
import { Store, Package, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import { useVoucherOffers } from '../../hooks/useVoucherOffers';
import { VendorVoucherSelector, PlatformVoucherPricing } from './VoucherPricing';

export function groupCartItemsByVendor(items = []) {
  const groups = {};
  items.forEach((item) => {
    const product = item.productVariant?.productColor?.product;
    const vendor = product?.vendor;
    const vId = vendor?.id || product?.vendorId || 'platform';
    const storeName = vendor?.storeName || 'Cửa hàng MIVA';
    if (!groups[vId]) {
      groups[vId] = {
        vendorId: vId,
        storeName,
        vendor,
        items: [],
        subtotal: 0,
      };
    }
    groups[vId].items.push(item);
    groups[vId].subtotal += Number(item.productVariant?.price || 0) * Number(item.quantity || 1);
  });
  return Object.values(groups);
}

export default function OrderSummaryPanel({
  mode = 'cart', // 'cart' | 'checkout'
  items = [],
  pricing,
  onProceedCheckout,
}) {
  const isCheckout = mode === 'checkout';

  const vendorPackages = useMemo(() => groupCartItemsByVendor(items), [items]);
  const subtotal = useMemo(
    () => vendorPackages.reduce((sum, pkg) => sum + pkg.subtotal, 0),
    [vendorPackages],
  );

  const productIds = useMemo(
    () => items.map((item) => item.productVariant?.productColor?.product?.id).filter(Boolean),
    [items],
  );
  const offers = useVoucherOffers(productIds);

  const totalDiscount = Number(pricing?.data?.discountAmount || 0);
  const grandTotal = pricing?.data?.totalAmount ?? subtotal;

  return (
    <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-5 sm:p-6 sticky top-24 shadow-luxury dark:shadow-luxury-dark space-y-5">
      {/* Header */}
      <div className="border-b border-light-border dark:border-dark-border pb-3">
        <h2 className="text-lg font-bold text-light-text dark:text-dark-text">
          {isCheckout
            ? `Kiện hàng & Ưu đãi (${vendorPackages.length} kiện)`
            : 'Tóm tắt thanh toán'}
        </h2>
        <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
          {items.length > 0
            ? `${items.length} sản phẩm đã chọn từ ${vendorPackages.length} gian hàng`
            : 'Chưa chọn sản phẩm nào'}
        </p>
      </div>

      {/* Multi-Vendor Notice when > 1 package */}
      {vendorPackages.length > 1 && (
        <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-2">
          <Package className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Đơn đặt hàng gồm <strong>{vendorPackages.length} kiện hàng</strong> tách riêng theo từng cửa hàng với mã vận đơn và ưu đãi riêng.
          </span>
        </div>
      )}

      {/* Unified Vendor Shipment Package Cards */}
      {vendorPackages.length === 0 ? (
        <div className="py-6 px-4 rounded-xl bg-light-bg dark:bg-dark-bg border border-dashed border-light-border dark:border-dark-border text-center text-xs text-light-muted dark:text-dark-muted">
          Vui lòng tích chọn ít nhất 1 sản phẩm trong giỏ hàng để xem tạm tính và áp dụng mã giảm giá.
        </div>
      ) : (
        <section aria-label="Mã giảm giá shop" className="space-y-3.5">
          {vendorPackages.map((pkg, idx) => {
            const pack = pricing?.data?.packages?.find((p) => p.vendorId === pkg.vendorId);
            const packShopDiscount =
              pack?.applications
                ?.filter((a) => a.scope === 'vendor')
                ?.reduce((s, a) => s + Number(a.discountAmount), 0) || 0;
            const packPlatformDiscount =
              pack?.applications
                ?.filter((a) => a.scope === 'platform')
                ?.reduce((s, a) => s + Number(a.discountAmount), 0) || 0;
            const packDiscount = packShopDiscount + packPlatformDiscount;
            const packTotal = pack ? Number(pack.totalAmount) : Math.max(0, pkg.subtotal - packDiscount);

            return (
              <div
                key={pkg.vendorId}
                className="p-3.5 rounded-xl border border-light-border dark:border-dark-border bg-light-bg/60 dark:bg-dark-bg/50 space-y-3"
              >
                {/* 1. Package Header */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-light-border dark:border-dark-border">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#1A3A2C] dark:text-primary min-w-0">
                    <Store className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">
                      {vendorPackages.length > 1
                        ? `Kiện ${idx + 1}: ${pkg.storeName}`
                        : pkg.storeName}
                    </span>
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-dark-card border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted shrink-0">
                    {pkg.items.length} SP
                  </span>
                </div>

                {/* 2. Package Items (shown in Checkout mode) */}
                {isCheckout && (
                  <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                    {pkg.items.map((item) => {
                      const pName =
                        item.productVariant?.productColor?.product?.name || 'Sản phẩm';
                      const imgUrl =
                        item.productVariant?.productColor?.imageUrls?.[0] ||
                        'https://placehold.co/80x80?text=MIVA';
                      const lineTotal =
                        Number(item.productVariant?.price || 0) * Number(item.quantity || 1);

                      return (
                        <div key={item.id} className="flex items-center justify-between gap-2.5 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={imgUrl}
                              alt={pName}
                              className="w-10 h-10 rounded-lg object-cover border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-light-text dark:text-dark-text line-clamp-1">
                                {pName}
                              </p>
                              <p className="text-[11px] text-light-muted dark:text-dark-muted">
                                SL: {item.quantity} | {item.productVariant?.productColor?.color} -{' '}
                                {item.productVariant?.size}
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-light-text dark:text-dark-text shrink-0">
                            {formatPrice(lineTotal)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3. Shop Voucher Selector inside the same unified package card */}
                <VendorVoucherSelector
                  vendorId={pkg.vendorId}
                  storeName={pkg.storeName}
                  groupItems={pkg.items}
                  pricing={pricing}
                  offers={offers}
                  compact
                />

                {/* 4. Package Subtotal / Discount / Total */}
                <div className="pt-2.5 border-t border-dashed border-light-border dark:border-dark-border space-y-1 text-xs">
                  <div className="flex justify-between text-light-muted dark:text-dark-muted">
                    <span>Tạm tính kiện hàng:</span>
                    <span className="font-medium text-light-text dark:text-dark-text">
                      {formatPrice(pkg.subtotal)}
                    </span>
                  </div>
                  {packShopDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Giảm voucher shop:</span>
                      <span className="font-semibold">-{formatPrice(packShopDiscount)}</span>
                    </div>
                  )}
                  {packPlatformDiscount > 0 && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400">
                      <span>Phân bổ voucher sàn:</span>
                      <span className="font-semibold">-{formatPrice(packPlatformDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-light-muted dark:text-dark-muted">
                    <span>Phí vận chuyển:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Miễn phí
                    </span>
                  </div>
                  <div className="pt-1.5 flex justify-between items-center font-bold">
                    <span className="text-light-text dark:text-dark-text">
                      {vendorPackages.length > 1 ? `Thành tiền kiện ${idx + 1}:` : 'Thành tiền kiện:'}
                    </span>
                    <span className="text-primary text-sm font-extrabold">
                      {formatPrice(packTotal)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Pricing Calculation Status / Error */}
      {pricing?.loading && items.length > 0 && (
        <p role="status" className="text-xs text-light-muted dark:text-dark-muted">
          Đang tính giá sau giảm...
        </p>
      )}
      {pricing?.error && items.length > 0 && (
        <div
          role="alert"
          className="text-xs text-rose-600 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900"
        >
          {pricing.error}{' '}
          <button
            type="button"
            className="underline font-semibold ml-1 cursor-pointer"
            onClick={pricing.refresh}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Platform Voucher + Grand Total */}
      <div className="space-y-3.5 text-sm pt-3 border-t border-light-border dark:border-dark-border">
        {items.length > 0 && (
          <PlatformVoucherPricing items={items} pricing={pricing} offers={offers} />
        )}

        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-light-muted dark:text-dark-muted">
            <span>
              Tạm tính ({items.length} sản phẩm
              {vendorPackages.length > 1 ? ` · ${vendorPackages.length} kiện` : ''}):
            </span>
            <span className="font-semibold text-light-text dark:text-dark-text">
              {formatPrice(subtotal)}
            </span>
          </div>

          {totalDiscount > 0 && (
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
              <span>Tổng giảm giá voucher:</span>
              <strong className="font-bold">-{formatPrice(totalDiscount)}</strong>
            </div>
          )}

          <div className="flex justify-between text-light-muted dark:text-dark-muted">
            <span>Phí vận chuyển:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Miễn phí</span>
          </div>
        </div>

        <div className="border-t border-light-border dark:border-dark-border pt-3.5 flex justify-between items-center">
          <div>
            <span className="font-bold text-light-text dark:text-dark-text block">
              Tổng thanh toán
            </span>
            <span className="text-[11px] text-light-muted dark:text-dark-muted">
              {vendorPackages.length > 1
                ? `Cho ${vendorPackages.length} đơn hàng độc lập`
                : 'Đã bao gồm thuế và phí'}
            </span>
          </div>
          <span
            data-testid={isCheckout ? 'checkout-total' : 'cart-total'}
            className="font-black text-2xl text-primary"
          >
            {formatPrice(grandTotal)}
          </span>
        </div>
      </div>

      {/* Cart CTA Button */}
      {!isCheckout && (
        <button
          type="button"
          onClick={onProceedCheckout}
          disabled={items.length === 0 || !pricing?.ready}
          className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Mua hàng ({items.length})</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
